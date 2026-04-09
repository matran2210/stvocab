import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '../api/client';
import {
  completeFlipCardGame,
  getFlipCardGame,
  type FlipCardGameCard,
  type FlipCardGameSession,
} from '../services/game-api';

type FlipCardGameSectionProps = {
  onRewardCollected: (gold: number) => void;
};

type GameCardState = FlipCardGameCard & {
  isRevealed: boolean;
  isMatched: boolean;
};

function createCardStates(cards: FlipCardGameCard[]) {
  return cards.map((card) => ({
    ...card,
    isRevealed: false,
    isMatched: false,
  }));
}

function formatVietnamDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate);
}

function getOpenUnmatchedCards(cards: GameCardState[]) {
  return cards.filter((card) => card.isRevealed && !card.isMatched);
}

function getMatchedPairs(cards: GameCardState[]) {
  return cards.filter((card) => card.isMatched).length / 2;
}

export function FlipCardGameSection({
  onRewardCollected,
}: FlipCardGameSectionProps) {
  const [session, setSession] = useState<FlipCardGameSession | null>(null);
  const [cards, setCards] = useState<GameCardState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('Lật 2 lá để tìm đúng 1 cặp từ và nghĩa.');
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const completionTriggeredRef = useRef(false);

  const matchedPairs = useMemo(() => getMatchedPairs(cards), [cards]);

  useEffect(() => {
    void loadLobby();
  }, []);

  useEffect(() => {
    if (!session?.board || cards.length === 0 || completionTriggeredRef.current) {
      return;
    }

    if (cards.every((card) => card.isMatched)) {
      completionTriggeredRef.current = true;
      setIsVictory(true);
      void finalizeGame(cards);
    }
  }, [cards, session]);

  const loadLobby = async () => {
    completionTriggeredRef.current = false;
    setErrorMessage('');
    setRewardMessage('');
    setIsRewardModalOpen(false);
    setStatusMessage('Sẵn sàng vào bàn. Nhấn bắt đầu để mở 8 lá bài.');
    setIsLoading(true);
    setIsVictory(false);
    setIsCompleting(false);
    setHasStarted(false);
    setCards([]);

    try {
      const nextSession = await getFlipCardGame();
      setSession(nextSession);
      setStatusMessage(
        nextSession.canPlay
          ? 'Sẵn sàng vào bàn. Nhấn bắt đầu để mở 8 lá bài.'
          : 'Bạn đã dùng hết lượt chơi hôm nay.'
      );
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Không thể tải bàn chơi lúc này'
      );
      setSession(null);
      setCards([]);
      setStatusMessage('Không thể tạo bàn chơi.');
    } finally {
      setIsLoading(false);
    }
  };

  const startGame = () => {
    if (!session?.board || isLoading || !session.canPlay) {
      return;
    }

    completionTriggeredRef.current = false;
    setErrorMessage('');
    setRewardMessage('');
    setIsRewardModalOpen(false);
    setIsVictory(false);
    setHasStarted(true);
    setCards(createCardStates(session.board.cards));
    setStatusMessage('Lật 2 lá để tìm đúng 1 cặp từ và nghĩa.');
  };

  const finalizeGame = async (currentCards: GameCardState[]) => {
    setIsCompleting(true);

    try {
      const reward = await completeFlipCardGame(
        Array.from(new Set(currentCards.map((card) => card.pairId)))
      );
      setRewardMessage(`${reward.message}. Bạn nhận ${reward.rewardGold} vàng.`);
      setHasStarted(false);
      setCards([]);
      setStatusMessage('Bạn đã dọn sạch bàn chơi. Có thể bắt đầu lượt mới khi sẵn sàng.');
      setIsRewardModalOpen(true);
      onRewardCollected(reward.gold);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Không thể nhận thưởng lúc này'
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCardClick = (cardId: string) => {
    if (isLoading || isCompleting || isVictory) {
      return;
    }

    const clickedCard = cards.find((card) => card.id === cardId);

    if (!clickedCard || clickedCard.isMatched) {
      return;
    }

    if (clickedCard.isRevealed) {
      const openCards = getOpenUnmatchedCards(cards);

      if (openCards.length === 1 && openCards[0]?.id === clickedCard.id) {
        setCards((currentCards) =>
          currentCards.map((card) =>
            card.id === clickedCard.id ? { ...card, isRevealed: false } : card
          )
        );
        setStatusMessage('Đã úp lá bài xuống. Bạn có thể chọn lại từ đầu.');
      }

      return;
    }

    const openCards = getOpenUnmatchedCards(cards);
    let workingCards = cards;

    if (openCards.length === 2) {
      const [firstOpenCard, secondOpenCard] = openCards;
      const shouldClosePreviousPair =
        firstOpenCard.pairId !== secondOpenCard.pairId ||
        firstOpenCard.type === secondOpenCard.type;

      if (shouldClosePreviousPair) {
        workingCards = workingCards.map((card) =>
          card.id === firstOpenCard.id || card.id === secondOpenCard.id
            ? { ...card, isRevealed: false }
            : card
        );
      }
    }

    const nextCards = workingCards.map((card) =>
      card.id === cardId ? { ...card, isRevealed: true } : card
    );
    const nextOpenCards = getOpenUnmatchedCards(nextCards);

    if (nextOpenCards.length === 2) {
      const [firstCard, secondCard] = nextOpenCards;
      const isMatchedPair =
        firstCard.pairId === secondCard.pairId && firstCard.type !== secondCard.type;

      if (isMatchedPair) {
        setCards(
          nextCards.map((card) =>
            card.id === firstCard.id || card.id === secondCard.id
              ? { ...card, isMatched: true }
              : card
          )
        );
        setStatusMessage('Khớp nghĩa chính xác. Cặp thẻ đã bị triệt tiêu.');
        return;
      }

      setCards(nextCards);
      setStatusMessage('Cặp này chưa khớp. Bấm lá tiếp theo để úp ngay và thử lại.');
      return;
    }

    setCards(nextCards);
    setStatusMessage('Đã lật 1 lá. Chọn thêm 1 lá để kiểm tra cặp.');
  };

  const canStartNewRound =
    !isLoading && !isCompleting && (session?.playStatus.remainingTurns ?? 0) > 0;

  const isPlaying = hasStarted && Boolean(session?.board) && !isLoading && !isVictory;

  return (
    <section className="relative overflow-hidden rounded-[34px] border-2 border-gray-900 bg-[#FFF7E8] p-3 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] sm:p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.85),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(255,155,113,0.25),_transparent_28%),linear-gradient(135deg,_rgba(188,231,253,0.22),_rgba(255,214,165,0.18))]" />

      <div className="relative z-10 space-y-4">
        {!isPlaying ? (
          <div className="rounded-[28px] border-2 border-gray-900 bg-[#1F2937] p-3 text-white shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] sm:p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border-2 border-gray-900 bg-[#9BE564] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-gray-900">
                  Flip Card Arena
                </div>
                <div className="rounded-full border-2 border-[#111827] bg-[#FFCC4D] px-4 py-2 text-sm font-black text-gray-900">
                  +{session?.rewardGold ?? 1000} vàng
                </div>
                <div className="rounded-full border-2 border-[#111827] bg-[#BCE7FD] px-4 py-2 text-sm font-black text-gray-900">
                  {matchedPairs}/{session?.board?.totalPairs ?? 4} cặp
                </div>
                <div className="rounded-full border-2 border-[#111827] bg-[#FFD6A5] px-4 py-2 text-sm font-black text-gray-900">
                  Lượt {session?.playStatus.turnNumber ?? 0}/{session?.playStatus.limit ?? 3}
                </div>
                <div className="rounded-full border-2 border-[#111827] bg-white px-4 py-2 text-sm font-black text-gray-900">
                  Còn {session?.playStatus.remainingTurns ?? 0} lượt
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="rounded-[20px] border-2 border-[#374151] bg-[#111827] px-4 py-3 text-sm font-bold leading-6 text-gray-100">
                  {statusMessage}
                </p>
                <button
                  type="button"
                  onClick={startGame}
                  disabled={!canStartNewRound}
                  className="rounded-full border-2 border-gray-900 bg-[#FF9B71] px-5 py-3 text-sm font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.22)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Đang tải...' : 'Bắt đầu chơi'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-[24px] border-2 border-red-500 bg-red-100 px-4 py-4 text-sm font-black text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="p-0 sm:p-0">
          {isLoading ? (
              <></>
          ) : !session?.board ? (
            <div className="rounded-[32px] border-2 border-gray-900 bg-[#1F2937] p-6 text-white shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] sm:p-8">
              <div className="mx-auto max-w-3xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[#9BE564]">
                  Flip Card Arena
                </p>
                <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                  Ghép đúng từ với nghĩa để quét sạch toàn bộ bàn chơi.
                </h2>
                <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-gray-200">
                  Một lượt gồm 8 lá bài, tương ứng 4 cặp. Bạn có thể mở, úp lại, và tìm ra đúng từng cặp từ vựng với nghĩa tương ứng để nhận thưởng.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[24px] border-2 border-gray-900 bg-[#FFF8E8] p-4 text-gray-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.18)]">
                    <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-gray-700">
                      Phần thưởng
                    </p>
                    <p className="mt-3 text-3xl font-black">
                      +{session?.rewardGold ?? 1000}
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-700">vàng mỗi màn</p>
                  </div>
                  <div className="rounded-[24px] border-2 border-gray-900 bg-[#BCE7FD] p-4 text-gray-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.18)]">
                    <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-gray-700">
                      Tiến độ hôm nay
                    </p>
                    <p className="mt-3 text-3xl font-black">
                      {session?.playStatus.turnNumber ?? 0}/{session?.playStatus.limit ?? 3}
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-700">
                      còn {session?.playStatus.remainingTurns ?? 0} lượt
                    </p>
                  </div>
                  <div className="rounded-[24px] border-2 border-gray-900 bg-[#FFD6A5] p-4 text-gray-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.18)]">
                    <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-gray-700">
                      Luật nhanh
                    </p>
                    <p className="mt-3 text-lg font-black leading-6">
                      8 lá, 4 cặp, khớp đúng là triệt tiêu.
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-700">
                      bấm tiếp lá thứ 3 để úp cặp sai ngay
                    </p>
                  </div>
                </div>

                {!session?.canPlay ? (
                  <div className="mt-6 rounded-[24px] border-2 border-red-400 bg-red-100 px-4 py-4 text-sm font-black text-red-700">
                    Ngày {session?.playStatus.date ? formatVietnamDate(session.playStatus.date) : '--'} bạn đã dùng hết lượt. Quay lại sau để nhận thêm lượt mới.
                  </div>
                ) : null}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={startGame}
                    disabled={!canStartNewRound}
                    className="rounded-full border-2 border-gray-900 bg-[#9BE564] px-6 py-4 text-base font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.18)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Vào bàn ngay
                  </button>
                  <p className="text-sm font-bold leading-6 text-gray-300">
                    {statusMessage}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
{cards.map((card, index) => {
  const isFaceUp = card.isRevealed || card.isMatched;

  return (
    <button
      key={card.id}
      type="button"
      onClick={() => handleCardClick(card.id)}
      disabled={card.isMatched || isCompleting}
      className="group relative w-full min-h-[180px] aspect-[3/4] select-none touch-manipulation rounded-[20px] text-left outline-none transition-transform duration-150 active:scale-[0.96] disabled:cursor-default"
      style={{
        perspective: '1000px',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        className="relative w-full h-full pointer-events-none rounded-[20px]"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFaceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transitionDelay: `${index * 15}ms`,
        }}
      >
        {/* =========================================
            LÁ BÀI MẶT ÚP (COVER)
            ========================================= */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[20px] border-[3px] border-gray-900 bg-[#7C3AED] shadow-[4px_4px_0px_0px_#111827]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Pattern chấm bi (Polka dots) tạo cảm giác vui nhộn */}
          <div className="absolute inset-0 bg-[radial-gradient(#fff_2px,transparent_2px)] opacity-20 [background-size:16px_16px]" />
          
          {/* Viền đứt nét bên trong */}
          <div className="absolute inset-2 rounded-[12px] border-2 border-dashed border-white/40" />
          
        </div>

        {/* =========================================
            LÁ BÀI MẶT NGỬA (CONTENT)
            ========================================= */}
        <div
          className={`absolute inset-0 flex flex-col justify-between rounded-[20px] border-[3px] border-gray-900 p-3 shadow-[4px_4px_0px_0px_#111827] ${
            card.isMatched
              ? 'bg-[#86EFAC]' // Xanh lá mượt mà khi ghép đúng
              : card.type === 'WORD'
              ? 'bg-[#93C5FD]' // Xanh dương tươi cho Từ Vựng
              : 'bg-[#FDBA74]' // Cam nhạt cho Nghĩa
          }`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Header của thẻ */}
          <div className="flex items-start justify-between gap-1">
            <span className="rounded-md border-2 border-gray-900 bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-900">
              {card.type === 'WORD' ? 'Word' : 'Meaning'}
            </span>
            {card.isMatched && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-900 bg-white text-[10px] shadow-[2px_2px_0px_0px_#111827]">
                ⭐
              </span>
            )}
          </div>

          {/* Nội dung chính giữa thẻ */}
          <div className="flex flex-1 items-center justify-center text-center px-1">
            <p className={`font-black text-gray-900 ${card.content.length > 12 ? 'text-lg leading-snug' : 'text-xl leading-tight sm:text-2xl'}`}>
              {card.content}
            </p>
          </div>

          {/* Footer (Phiên âm hoặc thông báo trạng thái) */}
          <div className="text-center">
            <p className="inline-block rounded-full border-2 border-gray-900/10 bg-white/50 px-3 py-1 text-[10px] font-bold text-gray-800">
              {card.phonetic || (card.isMatched ? 'Chính xác!' : 'Lật để ghép')}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
})}
            </div>
          )}
        </div>
      </div>

      {isRewardModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-[32px] border-2 border-gray-900 bg-[#FFF8E8] p-6 text-center shadow-[8px_8px_0px_0px_rgba(31,41,55,1)]">
            <p className="inline-flex rounded-full border-2 border-gray-900 bg-[#C9F2C7] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-gray-900">
              Hoàn thành
            </p>
            <h2 className="mt-4 text-3xl font-black text-gray-900">
              Bạn đã thắng màn chơi
            </h2>
            <p className="mt-3 text-base font-bold leading-7 text-gray-700">
              {rewardMessage || 'Bạn đã ghép đúng toàn bộ 4 cặp thẻ.'}
            </p>
            <button
              type="button"
              onClick={() => setIsRewardModalOpen(false)}
              className="mt-6 rounded-full border-2 border-gray-900 bg-[#FF9B71] px-6 py-3 text-base font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
            >
              Xác nhận
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { loginUser, registerUser, restoreUserSession } from '../services/auth-api';

type ScreenStep = 'welcome' | 'login' | 'register';

export function LandingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ScreenStep>('welcome');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      const isAuthenticated = await restoreUserSession();

      if (isAuthenticated) {
        navigate('/home', { replace: true });
        return;
      }

      if (isActive) {
        setIsCheckingSession(false);
      }
    };

    void run();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  const openStep = (nextStep: ScreenStep) => {
    setErrorMessage('');
    setStep(nextStep);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (step === 'login') {
        await loginUser({ email: email.trim(), password });
      } else {
        if (password !== confirmPassword) {
          setErrorMessage('Mật khẩu xác nhận chưa khớp');
          return;
        }

        await registerUser({
          name: fullName.trim(),
          email: email.trim(),
          password,
        });
      }

      navigate('/home', { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Không thể kết nối tới server'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFBF5] px-4 pb-10 pt-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center">
        <section className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[36px] border-2 border-gray-900 bg-[#9BE564] p-6 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] sm:p-8">
            <div className="mb-6 inline-flex rounded-full border-2 border-gray-900 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em]">
              StVocab
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Học từ vựng như đang chơi game, tiến bộ mỗi ngày trên điện thoại.
            </h1>
            <p className="mt-5 max-w-lg text-base font-bold leading-7 sm:text-lg">
              StVocab biến hành trình học tiếng Anh thành chuỗi nhiệm vụ ngắn,
              vui, dễ theo dõi và cực kỳ hợp với lịch học bận rộn.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[28px] border-2 border-gray-900 bg-[#FFF8E8] p-4 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                <p className="text-3xl font-black">5 phút</p>
                <p className="mt-2 text-sm font-bold">Mỗi chặng học đều ngắn và rõ mục tiêu.</p>
              </div>
              <div className="rounded-[28px] border-2 border-gray-900 bg-[#BCE7FD] p-4 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                <p className="text-3xl font-black">+XP</p>
                <p className="mt-2 text-sm font-bold">Thưởng điểm liên tục để giữ nhịp học tập.</p>
              </div>
              <div className="rounded-[28px] border-2 border-gray-900 bg-[#FFD6A5] p-4 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                <p className="text-3xl font-black">7 ngày</p>
                <p className="mt-2 text-sm font-bold">Theo dõi streak và quay lại học đều đặn.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border-2 border-gray-900 bg-[#FFF4D6] p-6 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] sm:p-8">
            {isCheckingSession ? (
              <div className="flex h-full items-center justify-center rounded-[28px] border-2 border-gray-900 bg-white p-6 text-center text-base font-black shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                Đang kiểm tra phiên đăng nhập...
              </div>
            ) : step === 'welcome' ? (
              <div className="flex h-full flex-col justify-between gap-8">
                <div>
                  <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.2em] text-gray-700">
                    Bắt đầu nhanh
                  </p>
                  <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                    Xây thói quen học từ vựng cùng lộ trình vui nhộn và rõ ràng.
                  </h2>
                  <p className="mt-4 text-base font-bold leading-7">
                    Học theo chủ đề, nhận điểm thưởng, mở khóa quà và duy trì chuỗi ngày học ngay từ lần đầu trải nghiệm.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[28px] border-2 border-gray-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                    <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-gray-700">
                      Đã có tài khoản?
                    </p>
                    <button
                      type="button"
                      onClick={() => openStep('login')}
                      className="mt-3 w-full rounded-full border-2 border-gray-900 bg-[#BCE7FD] px-5 py-3 text-base font-black shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
                    >
                      Login
                    </button>
                  </div>

                  <div className="rounded-[28px] border-2 border-gray-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                    <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-gray-700">
                      Chưa có tài khoản?
                    </p>
                    <button
                      type="button"
                      onClick={() => openStep('register')}
                      className="mt-3 w-full rounded-full border-2 border-gray-900 bg-[#FF9B71] px-5 py-3 text-base font-black shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
                    >
                      Tạo tài khoản
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col gap-6">
                <div>
                  <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.2em] text-gray-700">
                    {step === 'login' ? 'Đăng nhập tài khoản' : 'Tạo hồ sơ học tập'}
                  </p>
                  <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                    {step === 'login'
                      ? 'Tiếp tục phiên học của bạn bằng tài khoản đã đăng ký.'
                      : 'Mỗi bài học đều được cá nhân hóa để bạn đi tiếp dễ hơn.'}
                  </h2>
                  <p className="mt-4 text-base font-bold leading-7">
                    {step === 'login'
                      ? 'Đăng nhập để tiếp tục lộ trình học, theo dõi tiến độ và quay lại bài học đang làm.'
                      : 'Giao diện thân thiện, lộ trình theo cấp độ và phần thưởng rõ ràng giúp bạn giữ nhịp học ngay từ ngày đầu tiên.'}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[24px] border-2 border-gray-900 bg-[#F7C5CC] p-4 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                    <p className="text-lg font-black">Lộ trình theo chủ đề</p>
                    <p className="mt-1 text-sm font-bold">
                      Dễ chọn đúng bộ từ vựng bạn đang cần nhất.
                    </p>
                  </div>
                  <div className="rounded-[24px] border-2 border-gray-900 bg-[#C9F2C7] p-4 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                    <p className="text-lg font-black">Tiến độ trực quan</p>
                    <p className="mt-1 text-sm font-bold">
                      Nhìn thấy ngay mình đã học được bao nhiêu.
                    </p>
                  </div>
                </div>

                {errorMessage ? (
                  <div className="rounded-[24px] border-2 border-red-500 bg-red-100 px-4 py-3 text-sm font-black text-red-700">
                    {errorMessage}
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {step === 'register' ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-extrabold uppercase tracking-[0.14em] text-gray-700">
                        Họ và tên
                      </span>
                      <input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Ví dụ: Nguyễn Minh Anh"
                        className="w-full rounded-[24px] border-2 border-gray-900 bg-white px-4 py-4 text-base font-bold outline-none shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] placeholder:text-gray-500 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
                        required
                      />
                    </label>
                  ) : null}

                  <label className="block">
                    <span className="mb-2 block text-sm font-extrabold uppercase tracking-[0.14em] text-gray-700">
                      Email
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="ban@stvocab.vn"
                      className="w-full rounded-[24px] border-2 border-gray-900 bg-white px-4 py-4 text-base font-bold outline-none shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] placeholder:text-gray-500 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-extrabold uppercase tracking-[0.14em] text-gray-700">
                      Mật khẩu
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Ít nhất 8 ký tự"
                      minLength={8}
                      className="w-full rounded-[24px] border-2 border-gray-900 bg-white px-4 py-4 text-base font-bold outline-none shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] placeholder:text-gray-500 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
                      required
                    />
                  </label>

                  {step === 'register' ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-extrabold uppercase tracking-[0.14em] text-gray-700">
                        Xác nhận mật khẩu
                      </span>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Nhập lại mật khẩu"
                        minLength={8}
                        className="w-full rounded-[24px] border-2 border-gray-900 bg-white px-4 py-4 text-base font-bold outline-none shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] placeholder:text-gray-500 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
                        required
                      />
                    </label>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => openStep('welcome')}
                      className="rounded-full border-2 border-gray-900 bg-white px-5 py-3 text-base font-black shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 rounded-full border-2 border-gray-900 bg-[#9BE564] px-5 py-3 text-base font-black shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] disabled:cursor-wait disabled:opacity-70"
                    >
                      {isSubmitting
                        ? step === 'login'
                          ? 'Đang đăng nhập...'
                          : 'Đang tạo tài khoản...'
                        : step === 'login'
                          ? 'Đăng nhập'
                          : 'Tạo tài khoản'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

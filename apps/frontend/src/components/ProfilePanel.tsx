import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { changeUserPassword, logoutUser } from '../services/auth-api';
import { type AuthenticatedUser } from '../utils/auth';

type ProfilePanelProps = {
  user: AuthenticatedUser | null;
};

const fallbackUser: AuthenticatedUser = {
  id: '',
  name: 'Học viên StVocab',
  email: 'dangcapnhat@stvocab.vn',
  phone: null,
  status: 'active',
  packageLevel: 'Basic',
  gold: 0,
  learningPoints: 0,
  isOnboarded: false,
};

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border-2 border-gray-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-700">
        {label}
      </p>
      <p className="mt-2 break-words text-base font-black text-gray-900">
        {value}
      </p>
    </div>
  );
}

export function ProfilePanel({
  user,
}: ProfilePanelProps) {
  const navigate = useNavigate();
  const profile = user ?? fallbackUser;
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPassword('');
    setConfirmPassword('');
    setErrorMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận chưa khớp');
      return;
    }

    setIsSubmitting(true);

    try {
      await changeUserPassword(password);
      setSuccessMessage('Mật khẩu đã được cập nhật');
      closePasswordModal();
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Không thể đổi mật khẩu lúc này'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logoutUser();
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <section className="rounded-[32px] border-2 border-gray-900 bg-[#FFF4D6] p-5 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] sm:p-7">
        <div className="flex flex-col gap-4">
          <div className="rounded-[28px] border-2 border-gray-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-gray-900 bg-[#9BE564] text-xl font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                {(profile.name || profile.email || 'ST')
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() ?? '')
                  .join('')}
              </div>
              <div className="min-w-0">
                <p className="inline-flex rounded-full border-2 border-gray-900 bg-[#FFF4D6] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-700">
                  Hồ sơ học viên
                </p>
                <h1 className="mt-3 break-words text-2xl font-black leading-tight text-gray-900 sm:text-4xl">
                  {profile.name || 'Học viên StVocab'}
                </h1>
                <p className="mt-2 break-words text-sm font-bold leading-6 text-gray-700">
                  {profile.email}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <ProfileField
              label="Email"
              value={profile.email}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField
                label="Số điện thoại"
                value={profile.phone || 'Chưa cập nhật'}
              />
              <ProfileField
                label="Gói hiện tại"
                value={profile.packageLevel}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField
                label="Trạng thái"
                value={profile.status === 'active' ? 'Đang hoạt động' : profile.status}
              />
              <ProfileField
                label="Hướng dẫn ban đầu"
                value={profile.isOnboarded ? 'Đã hoàn tất' : 'Chưa hoàn tất'}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField
                label="Điểm học tập"
                value={`${profile.learningPoints} XP`}
              />
              <ProfileField
                label="Vàng hiện có"
                value={`${profile.gold}`}
              />
            </div>
          </div>

          {successMessage ? (
            <div className="rounded-[24px] border-2 border-gray-900 bg-white px-4 py-3 text-sm font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
              {successMessage}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="rounded-full border-2 border-gray-900 bg-[#BCE7FD] px-5 py-4 text-base font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
            >
              Đổi mật khẩu
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="rounded-full border-2 border-gray-900 bg-[#FF9B71] px-5 py-4 text-base font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] disabled:cursor-wait disabled:opacity-70"
            >
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
          </div>
        </div>
      </section>

      {isPasswordModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-4 pb-4 pt-20 sm:items-center">
          <div className="w-full max-w-md rounded-[32px] border-2 border-gray-900 bg-[#FFF8E8] p-5 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-gray-700">
                  Bảo mật
                </p>
                <h2 className="mt-2 text-2xl font-black text-gray-900">
                  Đổi mật khẩu
                </h2>
              </div>
              <button
                type="button"
                onClick={closePasswordModal}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-900 bg-white text-xl font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
              >
                ×
              </button>
            </div>

            <div className="mt-4 rounded-[24px] border-2 border-gray-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
              <p className="text-sm font-bold leading-6 text-gray-800">
                Nhập mật khẩu mới và xác nhận lại để cập nhật bảo mật cho tài khoản.
              </p>
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-[24px] border-2 border-red-500 bg-red-100 px-4 py-3 text-sm font-black text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold uppercase tracking-[0.14em] text-gray-700">
                  Mật khẩu mới
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

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="rounded-full border-2 border-gray-900 bg-white px-5 py-3 text-base font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
                >
                  Để sau
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-full border-2 border-gray-900 bg-[#9BE564] px-5 py-3 text-base font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] disabled:cursor-wait disabled:opacity-70"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

import { describe, it, expect } from 'vitest';
import { registerAction, loginAction } from '@/actions/auth';

describe('Auth Form Validations (SRS-01 & SRS-02)', () => {
  it('SRS-01: menolak registrasi jika kolom tidak lengkap', async () => {
    const formData = new FormData();
    formData.set('name', 'Bram');
    formData.set('email', '');
    formData.set('password', '123456');
    formData.set('confirmPassword', '123456');

    const result = await registerAction({}, formData);
    expect(result.error).toBe('Semua kolom wajib diisi.');
  });

  it('SRS-01: menolak registrasi dengan format email tidak valid', async () => {
    const formData = new FormData();
    formData.set('name', 'Bram');
    formData.set('email', 'bram-invalid-email');
    formData.set('password', '123456');
    formData.set('confirmPassword', '123456');

    const result = await registerAction({}, formData);
    expect(result.error).toBe('Format email tidak valid.');
  });

  it('SRS-01: menolak registrasi jika password kurang dari 6 karakter', async () => {
    const formData = new FormData();
    formData.set('name', 'Bram');
    formData.set('email', 'bram@example.com');
    formData.set('password', '12345');
    formData.set('confirmPassword', '12345');

    const result = await registerAction({}, formData);
    expect(result.error).toBe('Password minimal harus 6 karakter.');
  });

  it('SRS-01: menolak registrasi jika konfirmasi password tidak cocok', async () => {
    const formData = new FormData();
    formData.set('name', 'Bram');
    formData.set('email', 'bram@example.com');
    formData.set('password', 'password123');
    formData.set('confirmPassword', 'password999');

    const result = await registerAction({}, formData);
    expect(result.error).toBe('Konfirmasi password tidak cocok.');
  });

  it('SRS-02: menolak login jika email atau password kosong', async () => {
    const formData = new FormData();
    formData.set('email', '');
    formData.set('password', '');

    const result = await loginAction({}, formData);
    expect(result.error).toBe('Email dan password wajib diisi.');
  });
});

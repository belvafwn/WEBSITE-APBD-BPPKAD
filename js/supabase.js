// Konfigurasi Supabase
// Ganti dengan URL dan ANON KEY dari project Supabase Anda
const SUPABASE_URL = 'https://scernchnrrfmdxtqrxrd.supabase.co'; // Contoh: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZXJuY2hucnJmbWR4dHFyeHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTYxNDYsImV4cCI6MjA3MjM3MjE0Nn0.UWUcsuPl5JJ7Batu6PBt4gMyTiosTqTQJ6Ile0eFV_U'; // Ambil dari Supabase Dashboard

// Inisialisasi Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verifikasi koneksi (opsional, untuk debugging)
console.log('Supabase client initialized:', supabase ? 'Success' : 'Failed');

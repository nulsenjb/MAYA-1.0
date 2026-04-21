const { error } = await supabase.auth.signInWithPassword({ email, password });
if (error) {
  setMessage(error.message);
} else {
  window.location.href = '/dashboard';
}
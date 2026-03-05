export async function loginRequest(email: string, password: string) {

  const res = await fetch("http://localhost:8081/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
}
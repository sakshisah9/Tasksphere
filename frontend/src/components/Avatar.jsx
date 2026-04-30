export default function Avatar({ user, size = "md" }) {
  const initials = (user?.name || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className={`avatar ${size}`} style={{ background: user?.avatarColor || "#2563eb" }}>
      {initials}
    </span>
  );
}

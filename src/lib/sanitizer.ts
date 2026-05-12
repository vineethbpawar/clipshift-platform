export const sanitizeDescription = (text: string) => {
  if (!text) return "";
  
  // Patterns for emails, phones, URLs, and common social handles
  const patterns = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Phone
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g, // URL
    /@([A-Za-z0-9_]{1,15})/g // Instagram handles
  ];

  let sanitized = text;
  patterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, "[contact hidden - unlock required]");
  });

  return sanitized;
};

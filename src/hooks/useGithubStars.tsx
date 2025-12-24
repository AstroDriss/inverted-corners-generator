import { useState, useEffect } from "react";

const useGitHubStars = (owner: string, repo: string) => {
  const [stars, setStars] = useState(null);

  useEffect(() => {
    const fetchStars = async () => {
      const cacheKey = `stars-${owner}-${repo}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const { count, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > 5 * 60 * 1000; // 5 min

        if (!isExpired) return setStars(count);
      }

      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`
        );
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

        setStars(data.stargazers_count);

        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            count: data.stargazers_count,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.error("Rate limit or network error", error);
      }
    };

    fetchStars();
  }, [owner, repo]);

  return stars;
};

export default useGitHubStars;

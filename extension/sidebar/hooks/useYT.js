// Placeholder for useYT.js

export function useYT() {
  const getYoutubeTranscript = (videoId) => {
    console.log("Getting YouTube transcript for:", videoId);
    return "Dummy YouTube transcript.";
  };

  const summarizeYoutube = (videoId) => {
    console.log("Summarizing YouTube video:", videoId);
    return "Dummy YouTube summary.";
  };

  return { getYoutubeTranscript, summarizeYoutube };
}
// ----------------------------------------------------------------------

export function LoadingScreen() {
  return (
    <div className="w-full min-h-svh flex flex-col items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        style={{
          shapeRendering: "auto",
        }}
        width="100px"
        height="100px"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
      >
        <path
          fill="none"
          stroke="black"
          strokeWidth={10}
          strokeDasharray="205.271 51.318"
          d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z"
          strokeLinecap="round"
          style={{
            transform: "scale(0.8)",
            transformOrigin: "50px 50px",
          }}
        >
          <animate
            attributeName="stroke-dashoffset"
            repeatCount="indefinite"
            dur="2s"
            keyTimes="0;1"
            values="0;256.589"
          />
        </path>
      </svg>
    </div>
  );
}

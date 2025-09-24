export default function DashboardBg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1920 1080"
      fill="none"
      className="-z-50 absolute left-0 top-0 w-full h-full opacity-10 [mask-image:linear-gradient(to_right,white,transparent,transparent,white)]"
    >
      <g clipPath="url(#clip0_dashboard)">
        <rect width="1920" height="1080" />
        {/* 水平线条 */}
        {Array.from({ length: 22 }, (_, i) => (
          <line
            key={`h-${i}`}
            y1={49.5 + i * 50}
            x2="1920"
            y2={49.5 + i * 50}
            className="stroke-muted-foreground"
          />
        ))}
        {/* 垂直线条 */}
        <g clipPath="url(#clip1_dashboard)">
          {Array.from({ length: 38 }, (_, i) => (
            <line
              key={`v-${i}`}
              x1={49.6 + i * 50}
              y1="4"
              x2={49.6 + i * 50}
              y2="1084"
              className="stroke-muted-foreground"
            />
          ))}
        </g>
      </g>
      <defs>
        <clipPath id="clip0_dashboard">
          <rect width="1920" height="1080" fill="#000000" />
        </clipPath>
        <clipPath id="clip1_dashboard">
          <rect
            width="1920"
            height="1080"
            fill="#000000"
            transform="translate(-1 4)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}
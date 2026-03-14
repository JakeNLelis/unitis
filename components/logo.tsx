import Image from "next/image";

interface LogoProps {
  size?: "sm" | "lg";
  color?: "blue" | "white";
  className?: string;
}

export function Logo({
  size = "lg",
  color = "blue",
  className = "",
}: LogoProps) {
  const sizes = {
    sm: { width: 30, height: 30, fontSize: "text-xl" },
    lg: { width: 40, height: 40, fontSize: "text-[30px]" },
  };

  const image = color === "blue" ? "logo-blue.png" : "logo-white.png";
  const textColor = color === "blue" ? "text-primary" : "text-white";
  const sizeClasses = sizes[size];

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <Image
        src={`/${image}`}
        alt="Plenum Logo"
        width={sizeClasses.width}
        height={sizeClasses.height}
      />
      <h1
        className={`font-(family-name:--font-erica-one) ${sizeClasses.fontSize} ${textColor} tracking-[-1px]`}
      >
        PLENUM
      </h1>
    </div>
  );
}

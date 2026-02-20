import React from "react";

const Logo = ({
  className = "",
  onClick,
  variant = "light",
  iconOnly = false,
}) => {
  const src = iconOnly
    ? "/assets/icon_dwello.png"
    : variant === "dark"
      ? "/assets/logo_dwello_dark.png"
      : "/assets/logo_dwello_light.png";

  return (
    <div
      className={`flex items-center ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <img
        src={src}
        alt="Dwello"
        className={iconOnly ? "h-7 w-7" : "h-7 w-auto"}
      />
    </div>
  );
};

export default Logo;

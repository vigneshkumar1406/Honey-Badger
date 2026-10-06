"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export default function ProductGallery({ product, colorImages = {} }) {
  const firstColor = product?.colors?.[0]?.name || "";
  const [color, setColor] = useState(firstColor);
  const [selected, setSelected] = useState(0);

  const base = product?.images || [];
  const images = useMemo(() => {
    const colorSet = colorImages?.[color];
    return Array.isArray(colorSet) && colorSet.length ? colorSet : base;
  }, [color, colorImages, base]);

  useEffect(() => {
    const handleColorChange = (event) => {
      setColor(String(event.detail || ""));
      setSelected(0);
    };
    window.addEventListener("hb-color-change", handleColorChange);
    return () => window.removeEventListener("hb-color-change", handleColorChange);
  }, []);

  useEffect(() => {
    if (selected >= images.length) setSelected(0);
  }, [images.length, selected]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
        {images[selected] && (
          <Image
            src={images[selected]}
            alt={product.name + (color ? " " + color : "")}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, index) => (
            <button
              key={img + "-" + index}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={"View product image " + (index + 1)}
              className={"relative aspect-square bg-neutral-100 overflow-hidden border-2 " + (selected === index ? "border-black" : "border-transparent")}
            >
              <Image src={img} alt="" fill sizes="15vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import VehicleCard from "./VehicleCard";
import { VehicleGridSkeleton } from "@/components/ui/feedback";

export default function VehicleCarousel({ vehicles, loading }: { vehicles: Vehicle[]; loading?: boolean }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: false,
    skipSnaps: false,
  });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => {
      setSnaps(emblaApi.scrollSnapList());
      onSelect();
    });
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  if (loading) return <VehicleGridSkeleton count={3} />;
  if (vehicles.length === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="min-w-0 flex-[0_0_82%] sm:flex-[0_0_46%] lg:flex-[0_0_31.5%] xl:flex-[0_0_23.5%]"
            >
              <VehicleCard vehicle={vehicle} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2" role="tablist" aria-label="Posición del carrusel">
          {snaps.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === selected}
              aria-label={`Ir al vehículo ${index + 1}`}
              onClick={() => scrollTo(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === selected ? "w-8 bg-lime" : "w-4 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Vehículo anterior"
            className="flex size-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-lime hover:text-lime disabled:opacity-40"
            disabled={selected === 0}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Vehículo siguiente"
            className="flex size-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-lime hover:text-lime disabled:opacity-40"
            disabled={selected >= snaps.length - 1}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

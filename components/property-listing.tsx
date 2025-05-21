"use client";
type Address = {
  street: string;
  city: string;
  state: string;
  postal: string;
};

type RawRoom = { $: { RoomType: string }; Count: string };
type RawFile = { Src: string };

type RawProperty = {
  PropertyID: {
    MarketingName: string;
    Address: {
      Address: string;
      City: string;
      State: string;
      PostalCode: string;
    };
  };
  Floorplan: {
    File: RawFile[] | RawFile;
    Room: RawRoom[] | RawRoom;
    EffectiveRent: { $: { Min: string; Max: string } };
    SquareFeet?: { $: { Min: string; Max?: string } };
  };
  Information: {
    StructureType: string;
    LongDescription: string;
  };
};

import {
  Bath,
  Bed,
  Calendar,
  Home,
  MapPin,
  Maximize2,
  Phone,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Newspaper,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Link from "next/link";

/* const propertyImages = [
  "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg",
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
  "https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg",
  "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg",
  "https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg",
  "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg",
]; */

export default function PropertyListing() {
  const params = useSearchParams();
  const slug = params.get("slug") || "";

  const [prop, setProp] = useState<RawProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);

  useEffect(() => {
    if (!slug) {
      setError("No property specified.");
      setLoading(false);
      return;
    }
    fetch(`/api/property?slug=${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data: RawProperty) => setProp(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="p-8 text-center">Loading…</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
  if (!prop) return null;

  const {
    PropertyID: {
      MarketingName: title,
      Address: {
        Address: street,
        City: city,
        State: state,
        PostalCode: postal,
      },
    },
    Floorplan: {
      EffectiveRent: {
        $: { Min: rent },
      },

      File: files,
    },
    Information: { StructureType: type, LongDescription: description },
  } = prop;
  // normalize rooms
  const rooms = Array.isArray(prop.Floorplan.Room)
    ? prop.Floorplan.Room
    : [prop.Floorplan.Room];

  const beds = parseInt(
    rooms.find((r) => r.$.RoomType === "Bedroom")?.Count ?? "0",
    10
  );
  const baths = parseInt(
    rooms.find((r) => r.$.RoomType === "Bathroom")?.Count ?? "0",
    10
  );

  // sqft
  const sqft =
    parseInt(prop.Floorplan.SquareFeet?.$.Min as string, 10).toLocaleString(
      "en-US"
    ) ?? "N/A";

  // images array
  //const files = Floorplan.File;
  const images: string[] = Array.isArray(files)
    ? files.map((f) => f.Src)
    : [files.Src];
  console.log(images, sqft, rent, baths, beds);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextMobileImage = () => {
    setMobileImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousMobileImage = () => {
    setMobileImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery Section */}
      <div className="grid md:grid-cols-2 gap-2 h-[40vh] md:h-[60vh]">
        {/* Main Image */}
        <div
          className="relative bg-cover bg-center cursor-pointer col-span-2 md:col-span-1"
          style={{
            backgroundImage: `url('${images[mobileImageIndex]}')`,
          }}
          onClick={() => {
            setCurrentImageIndex(mobileImageIndex);
            setLightboxOpen(true);
          }}
        >
          <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors" />

          {/* Mobile Navigation Arrows */}
          <div className="md:hidden absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/30 hover:bg-black/50 text-white"
              onClick={(e) => {
                e.stopPropagation();
                previousMobileImage();
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/30 hover:bg-black/50 text-white"
              onClick={(e) => {
                e.stopPropagation();
                nextMobileImage();
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </div>

        {/* Side Images Grid */}
        <div className="hidden md:grid grid-cols-2 gap-2 md:relative">
          {images.slice(1, 5).map((image, index) => (
            <div
              key={index}
              className="relative bg-cover bg-center cursor-pointer"
              style={{ backgroundImage: `url('${image}')` }}
              onClick={() => {
                setCurrentImageIndex(index + 1);
                setLightboxOpen(true);
              }}
            >
              <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors" />
            </div>
          ))}
          <div
            className="absolute bottom-3 right-5 bg-white rounded-md p-2 text-xs  cursor-pointer"
            onClick={() => {
              setCurrentImageIndex(1);
              setLightboxOpen(true);
            }}
          >
            {images.length} Photos
          </div>
        </div>

        {/* Property Title Overlay */}
        {/*  <div className="absolute bottom-8 left-4 right-4 md:left-8 md:right-8 z-10">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4">
              1008 E 24th Avenue
            </h1>
          </div>
        </div> */}
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl md:text-3xl font-bold">
                ${parseInt(rent, 10).toLocaleString("en-US")}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-lg text-gray-900 flex items-center gap-2 mb-6">
              <MapPin className="h-5 w-5" />
              {street}, {city}, {state} {postal}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-gray-500" />
                <span>{beds} Beds</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-gray-500" />
                <span>{baths} Baths</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5 text-gray-500" />
                <span>{sqft} sqft</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-gray-500" />
                <span>Single Family</span>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="prose max-w-none">
              <h3 className="text-xl md:text-2xl font-semibold mb-4">
                Property Details
              </h3>
              <div className="text-gray-600 mb-4">
                {description.split(".").map((sentence, index) =>
                  index === 3 ? (
                    <div className="mb-2" key={index}>
                      {sentence}.
                    </div>
                  ) : (
                    sentence + "."
                  )
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  Next Steps
                </h3>
                <p className="text-gray-500">
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Available for showings
                </p>
              </div>

              <Button
                variant="secondary"
                className="w-full mb-4 bg-white text-[#2563EB]"
              >
                Request Viewing
              </Button>
              <Button className="w-full" variant="default">
                <Link href="/apply" className="flex items-center text-white">
                  <Newspaper className="h-4 w-4 mr-2" />
                  Apply now
                </Link>
              </Button>

              <Separator className="my-6" />
            </Card>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl bg-black/95 border-none">
          <div className="relative h-[80vh] flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 text-white hover:bg-white/20"
              onClick={previousImage}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <img
              src={images[currentImageIndex]}
              alt={`Property image ${currentImageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 text-white hover:bg-white/20"
              onClick={nextImage}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

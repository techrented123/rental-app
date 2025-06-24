"use client";
import {
  Bath,
  Bed,
  Calendar,
  Home,
  MapPin,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Image,
  Newspaper,
  ChevronDown,
} from "lucide-react";
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
      Email: string;
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

type Appointment = {
  name: string;
  email: string;
  message: string;
};
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import ContactForm from "./ContactForm";
import { useRouter } from "next/navigation";
import AddressMap from "./AddressMap";

export default function PropertyListing() {
  const params = useSearchParams();
  const slug = params.get("slug") || "";
  const router = useRouter();
  const [prop, setProp] = useState<RawProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [linesNumber, setLinesNumber] = useState(3);

  const { updateRentalInfo } = useRentalApplicationContext();
  useEffect(() => {
    if (!slug) {
      setError("No property specified.");
      setLoading(false);
      router.push("/404");
      return;
    }
    updateRentalInfo({ slug });
    fetch(`/api/property?slug=${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data: RawProperty) => setProp(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (prop) {
      updateRentalInfo({
        landlordEmail: prop.PropertyID.Address.Email,
        landlordName: "Rob Boies",
        address: prop.PropertyID.Address,
        rent: prop.Floorplan.EffectiveRent.$.Min,
        slug,
      });
    }
  }, [prop, updateRentalInfo]);

  if (loading)
    return (
      <div className="animate-pulse p-8 min-h-screen">
        <div className="p-3 grid md:grid-cols-2 gap-4 h-[40vh] md:h-[60vh]">
          <div className="bg-gray-200 rounded-xl relative bg-cover bg-center cursor-pointer col-span-2 md:col-span-1"></div>
          <div className="bg-gray-200 hidden md:grid grid-cols-2 gap-2 md:relative rounded-lg">
            {Array(5)
              .fill(0)
              .slice(1, 5)
              .map((_, index) => (
                <div
                  key={index}
                  className="relative bg-cover bg-gray-200  bg-center cursor-pointer rounded-lg"
                >
                  <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors rounded-md" />
                </div>
              ))}
          </div>
        </div>
        <div className="container mx-auto px-4 py-8  ">
          <div className="grid md:grid-cols-3 gap-8 ">
            <div className="md:col-span-2 bg-gray-200 h-[40vh] rounded-xl"></div>
            <div className="md:col-span-1 mb-6 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
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
        Email: landlordEmail,
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

  const sentences = description.split(".");
  console.log({ sentences });
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

  const submitHandler = async (formData: Appointment) => {
    try {
      const response = await fetch("/api/sendAppointment", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          landlordEmail,
          street,
          landlordName: "Rob Boies",
        }),
      });
      if (!response.ok) throw new Error(``);
      const data = await response.json();
      if (data.$metadata.httpStatusCode === 200) {
        setShowResponse(true);
      }
    } catch (e) {
    } finally {
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 rounded-xl ">
      {/* Image Gallery Section */}
      <div className="p-3 grid md:grid-cols-2 gap-2 h-[40vh] md:h-[60vh]">
        {/* Main Image */}
        <div
          className="rounded-xl relative bg-cover bg-center cursor-pointer col-span-2 md:col-span-1"
          style={{
            backgroundImage: `url('${images[mobileImageIndex]}')`,
            borderRadius: "12px",
          }}
          onClick={() => {
            setCurrentImageIndex(mobileImageIndex);
            setLightboxOpen(true);
          }}
        >
          <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors rounded-xl" />

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
        <div className="hidden md:grid grid-cols-2 gap-2 md:relative rounded-lg">
          {images.slice(1, 5).map((image, index) => (
            <div
              key={index}
              className="relative bg-cover bg-center cursor-pointer rounded-lg"
              style={{ backgroundImage: `url('${image}')` }}
              onClick={() => {
                setCurrentImageIndex(index + 1);
                setLightboxOpen(true);
              }}
            >
              <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors rounded-md" />
            </div>
          ))}
          <div
            className="flex gap-2 items-center absolute bottom-3 right-5 bg-white rounded-md p-2 text-xs  cursor-pointer"
            onClick={() => {
              setCurrentImageIndex(1);
              setLightboxOpen(true);
            }}
          >
            <Image size={14} /> {images.length} Photos
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl md:text-3xl font-bold">
                ${parseInt(rent, 10).toLocaleString("en-US")}
              </h2>
              {/*   <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div> */}
            </div>
            <p className="text-lg text-gray-900 flex items-center gap-2 mb-6">
              <MapPin className="h-5 w-5 hidden md:flex" />
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
              <h3 className="text-xl md:text-xl font-semibold mb-4">
                Property Details
              </h3>
              <div className="mb-4 space-y-1">
                <div className={`text-gray-600 line-clamp-${linesNumber}`}>
                  {description}
                </div>
                {sentences.length > 3 && (
                  <div>
                    {linesNumber === 3 ? (
                      <span
                        onClick={() => {
                          setLinesNumber(sentences.length);
                        }}
                        className="hover:cursor-pointer underline"
                      >
                        Show More
                      </span>
                    ) : (
                      <span
                        onClick={() => {
                          setLinesNumber(3);
                        }}
                        className="hover:cursor-pointer underline"
                      >
                        Show Less
                      </span>
                    )}
                  </div>
                )}
              </div>
              <h3 className="text-xl md:text-xl font-semibold my-4 pt-2">
                Location
              </h3>
              <AddressMap address={`${street} ${city} ${state}`} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 mb-6">
            <Card className="p-6 shadow-md">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Next Steps</h3>
                <p className="text-gray-500">
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Available for viewings
                </p>
              </div>
              <Button
                className="w-full border-primary bg-white hover:bg-gray-100"
                variant="outline"
                onClick={() => setOpen(true)}
              >
                Request Viewing
              </Button>{" "}
              <Separator className="my-5" />
              <Link
                href={`/apply/?slug=${slug}`}
                className="flex items-center text-white "
              >
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-500"
                  variant="default"
                >
                  <Newspaper className="h-4 w-4 mr-2" />
                  Apply now
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl bg-black/50 border-none">
          <DialogTitle> </DialogTitle>
          <div className="relative h-[80vh] flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6 text-white " />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 text-white hover:bg-white/20"
              onClick={previousImage}
            >
              <ChevronLeft className="h-8 w-8 text-white " />
            </Button>

            <img
              src={images[currentImageIndex]}
              alt={`Property image ${currentImageIndex + 1}`}
              className="max-h-full max-w-full object-contain rounded-lg"
            />

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 text-white hover:bg-white/20"
              onClick={nextImage}
            >
              <ChevronRight className="h-8 w-8 text-white " />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ContactForm
        title={street}
        onSubmit={submitHandler}
        open={open}
        onOpen={setOpen}
        showResponse={showResponse}
      />
    </div>
  );
}

import React, { useState } from "react";
import { TableCell } from "./ui/table";
import S3ImageComponent from "./S3ImageComponent";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent } from "./ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Question } from "@prisma/client";
import Image from "next/image";
import Loader from "./Loader";
import { useS3SignedURL } from "@/hooks/useS3";

export default function ImagesClickableCarousel({
  question,
}: {
  question: Question;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const allImages = [
    ...question.questionImages,
    ...question.chatImages,
    ...question.answerImages,
  ];

  return (
    <>
      {/* Table Cell with Image and Badge */}
      <div onClick={() => setIsOpen(true)}>
        <TableCell className="flex gap-4 items-center cursor-pointer">
          <S3ImageComponent url={question.questionImages[0]} />
          <Badge>{allImages.length} Images</Badge>
        </TableCell>
      </div>

      {/* Modal with Carousel */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen-lg">
          <Carousel className="w-full">
            <CarouselContent>
              {allImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="flex justify-center items-center p-4">
                    <BigS3ImageComponent url={image} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
}

function BigS3ImageComponent({ url }: { url: string }) {
  const res = useS3SignedURL(url);
  if (res.isError || !res.data) return <div>Error</div>;
  if (res.isLoading)
    return (
      <div className="grid place-items-center w-[400px] aspect-square">
        <Loader />
      </div>
    );
  return <Image src={res.data} alt="Question" width={700} height={700} />;
}

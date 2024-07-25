"use client";
import React, { useRef, useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { CameraIcon, TrashIcon } from "lucide-react";
import Camera from "@/components/ui/camera/camera";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "./ui/input";
import Image from "next/image";
import { useCreateQuestion } from "@/hooks/useQuestions";
import toast from "react-hot-toast";
import { getSession } from "next-auth/react";

export default function QuestionsUploader({ userId }: { userId: string }) {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const createQuestion = useCreateQuestion();

  const onFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () =>
          reader.result &&
          setImages((prev) => [...prev, reader.result as string]),
        false
      );
      const file = files[i];
      reader.readAsDataURL(file);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = () => {
    createQuestion.mutate(
      { images, userId },
      {
        onSuccess: () => {
          toast.success("Questions uploaded successfully");
          setImages([]);
        },
        onError: (error) => {
          toast.error(`Error uploading questions: ${error.message}`);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Images</CardTitle>
        <CardDescription>
          Upload Images from Device or use camera
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Dialog open={showDialog} onOpenChange={(open) => setShowDialog(open)}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full flex justify-start">
              <CameraIcon className="mr-2 h-5 w-5" />
              Capture Photo
              <span className="sr-only">Capture</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="h-svh w-svw max-w-full p-0">
            <Camera
              onClosed={() => {
                setShowDialog(false);
              }}
              onCapturedImages={(images) => {
                setImages((prev) => [...prev, ...images]);
                setShowDialog(false);
              }}
            />
          </DialogContent>
        </Dialog>

        <Input
          ref={inputRef}
          type="file"
          accept="image/jpeg"
          multiple
          onChange={onFilesUpload}
        />

        <div>
          {images.length === 0
            ? "No Files Selected"
            : `${images.length} Files Selected`}
          <div className="flex flex-wrap gap-4 px-2 my-2">
            {images.map((image, i) => (
              <div
                key={i}
                className="w-[200px] h-[150px] flex justify-between rounded-md p-1 flex-col border-[1px] border-opacity-25 border-slate-500"
              >
                <div className="w-full h-2/3 relative">
                  <Image
                    src={image}
                    alt={`Image-${i}`}
                    fill
                    objectFit="contain"
                  />
                </div>
                <Button
                  onClick={() => {
                    images.splice(i, 1);
                    setImages([...images]);
                  }}
                  variant="outline"
                  className="flex gap-2"
                >
                  <TrashIcon />
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setImages([])}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={createQuestion.isPending || images.length === 0}
        >
          {createQuestion.isPending ? "Uploading..." : "Upload"}
        </Button>
      </CardFooter>
    </Card>
  );
}

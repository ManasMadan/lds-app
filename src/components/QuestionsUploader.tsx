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
import { useRouter } from "next/navigation";

export default function QuestionsUploader({ userId }: { userId: string }) {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [currentImageType, setCurrentImageType] = useState<
    "question" | "answer" | "chat" | null
  >(null);
  const [questionImages, setQuestionImages] = useState<string[]>([]);
  const [answerImages, setAnswerImages] = useState<string[]>([]);
  const [chatImages, setChatImages] = useState<string[]>([]);
  const [subject, setSubject] = useState<string>("");

  const inputRefs = {
    question: useRef<HTMLInputElement>(null),
    answer: useRef<HTMLInputElement>(null),
    chat: useRef<HTMLInputElement>(null),
  };

  const router = useRouter();
  const createQuestion = useCreateQuestion();

  const handleFileUpload = (
    type: "question" | "answer" | "chat",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length) {
          switch (type) {
            case "question":
              setQuestionImages((prev) => [...prev, ...newImages]);
              break;
            case "answer":
              setAnswerImages((prev) => [...prev, ...newImages]);
              break;
            case "chat":
              setChatImages((prev) => [...prev, ...newImages]);
              break;
          }
        }
      };
      reader.readAsDataURL(file);
    }
    if (inputRefs[type].current) inputRefs[type].current.value = "";
  };

  const handleCapture = (
    type: "question" | "answer" | "chat",
    images: string[]
  ) => {
    switch (type) {
      case "question":
        setQuestionImages((prev) => [...prev, ...images]);
        break;
      case "answer":
        setAnswerImages((prev) => [...prev, ...images]);
        break;
      case "chat":
        setChatImages((prev) => [...prev, ...images]);
        break;
    }
    setShowDialog(false);
  };

  const handleUpload = () => {
    // TODO date input from SME
    const currentDate = new Date();
    createQuestion.mutate(
      {
        questionImages: questionImages,
        answerImages: answerImages,
        chatImages: chatImages,
        userId,
        subject,
      },
      {
        onSuccess: () => {
          toast.success("Questions uploaded successfully");
          setQuestionImages([]);
          setAnswerImages([]);
          setChatImages([]);
          setSubject("");
          router.refresh(); // If you want to refresh the page or trigger a state update
        },
        onError: (error) => {
          toast.error(`Error uploading questions: ${error.message}`);
        },
      }
    );
  };

  const removeImage = (type: "question" | "answer" | "chat", index: number) => {
    switch (type) {
      case "question":
        setQuestionImages((prev) => prev.filter((_, i) => i !== index));
        break;
      case "answer":
        setAnswerImages((prev) => prev.filter((_, i) => i !== index));
        break;
      case "chat":
        setChatImages((prev) => prev.filter((_, i) => i !== index));
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Question</CardTitle>
        <CardDescription>
          Upload or Capture Multiple Images for Question, Answer, and Chat
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {["question", "answer", "chat"].map((type) => (
          <div key={type} className="mb-4">
            <div className="grid grid-cols-2 gap-4 items-center">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentImageType(type as "question" | "answer" | "chat");
                  setShowDialog(true);
                }}
              >
                <CameraIcon className="mr-2 h-5 w-5" />
                Capture {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
              <Input
                ref={inputRefs[type as "question" | "answer" | "chat"]}
                type="file"
                accept="image/jpeg"
                multiple
                onChange={(e) =>
                  handleFileUpload(type as "question" | "answer" | "chat", e)
                }
              />
            </div>
            {(type === "question" && questionImages.length > 0) ||
            (type === "answer" && answerImages.length > 0) ||
            (type === "chat" && chatImages.length > 0) ? (
              <div className="flex flex-wrap gap-4 px-2 my-2">
                {(type === "question"
                  ? questionImages
                  : type === "answer"
                  ? answerImages
                  : chatImages
                ).map((image, i) => (
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
                      onClick={() =>
                        removeImage(type as "question" | "answer" | "chat", i)
                      }
                      variant="outline"
                      className="flex gap-2"
                    >
                      <TrashIcon />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div>No Files Selected</div>
            )}
          </div>
        ))}

        <Input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setQuestionImages([]);
            setAnswerImages([]);
            setChatImages([]);
            setSubject("");
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={
            createQuestion.isPending ||
            questionImages.length === 0 ||
            answerImages.length === 0 ||
            chatImages.length === 0 ||
            !subject
          }
        >
          {createQuestion.isPending ? "Uploading..." : "Upload"}
        </Button>
      </CardFooter>

      <Dialog open={showDialog} onOpenChange={(open) => setShowDialog(open)}>
        <DialogTrigger asChild>
          <Button variant="outline" className="hidden" />
        </DialogTrigger>
        <DialogContent className="h-svh w-svw max-w-full p-0">
          <Camera
            onClosed={() => setShowDialog(false)}
            onCapturedImages={(images) =>
              handleCapture(currentImageType!, images)
            }
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ImagePreview({
  src,
  onDelete,
}: {
  src: string;
  onDelete: () => void;
}) {
  return (
    <div className="w-[200px] h-[150px] flex justify-between rounded-md p-1 flex-col border-[1px] border-opacity-25 border-slate-500">
      <div className="w-full h-2/3 relative">
        <Image src={src} alt="Uploaded Image" fill objectFit="contain" />
      </div>
      <Button onClick={onDelete} variant="outline" className="flex gap-2">
        <TrashIcon />
        Delete
      </Button>
    </div>
  );
}

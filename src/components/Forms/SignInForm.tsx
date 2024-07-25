"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { SignInFormInputs, signInSchema } from "@/lib/schema";
import toast from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

const SignInForm: React.FC = () => {
  const router = useRouter();
  const form = useForm<SignInFormInputs>({
    resolver: zodResolver(signInSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: SignInFormInputs) => {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onError: (error) => {
      toast.error("Error signing in");
    },
    onSuccess: (data) => {
      router.push("/");
      toast.success("Signed in successfully");
    },
  });

  const onSubmit = (data: SignInFormInputs) => {
    mutation.mutate(data);
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Use your account credentials to sign in
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder="password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={() => {
                form.reset({
                  email: "",
                  password: "",
                });
              }}
              variant="outline"
              type="reset"
            >
              Cancel
            </Button>
            <Button
              className="mt-0"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing In" : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SignInForm;

"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CreateUserFormInputs, signUpSchema, userRoles } from "@/lib/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateUser } from "@/hooks/useUsers";

const CreateUserForm: React.FC = () => {
  const form = useForm<CreateUserFormInputs>({
    resolver: zodResolver(signUpSchema),
  });

  const createUserMutation = useCreateUser();

  const onSubmit = (data: CreateUserFormInputs) => {
    createUserMutation.mutate(data, {
      onSuccess: () => {
        toast.success("User Created successfully");
        form.reset();
      },
      onError: (error) => {
        console.log(error);
        toast.error("Error Creating User");
      },
    });
  };
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create User</CardTitle>
        <CardDescription>Create a new user account</CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" placeholder="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" placeholder="email" {...field} />
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select user role" />
                      </SelectTrigger>
                      <SelectContent>
                        {userRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? "Creating User" : "Create User"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default CreateUserForm;

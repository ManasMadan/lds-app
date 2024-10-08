"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTeamFormInputs, createTeamSchema } from "@/lib/schema";
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
import { useCreateTeam } from "@/hooks/useTeams";

const CreateTeamForm: React.FC = () => {
  const form = useForm<CreateTeamFormInputs>({
    resolver: zodResolver(createTeamSchema),
  });

  const createTeamMutation = useCreateTeam();

  const onSubmit = (data: CreateTeamFormInputs) => {
    createTeamMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Team Created successfully");
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
        <CardTitle>Create Team</CardTitle>
        <CardDescription>Create a new team.</CardDescription>
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={() => {
                form.reset({
                  name: "",
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
              disabled={createTeamMutation.isPending}
            >
              {createTeamMutation.isPending ? "Creating Team" : "Create Team"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default CreateTeamForm;

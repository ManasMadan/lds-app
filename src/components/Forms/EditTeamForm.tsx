import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EditTeamFormInputs, editTeamSchema } from "@/lib/schema";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateTeamName } from "@/lib/api/team";
import { Team } from "@prisma/client";

interface EditTeamFormProps {
  team: Team | null;
  onClose: () => void;
}

const EditTeamForm: React.FC<EditTeamFormProps> = ({ team, onClose }) => {
  const queryClient = useQueryClient();

  const form = useForm<EditTeamFormInputs>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: {
      name: team?.name || "",
    },
  });

  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name || "",
      });
    }
  }, [team, form]);

  const mutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<EditTeamFormInputs>;
    }) => updateTeamName(id, data.name!),
    onError: (error) => {
      console.log(error);
      toast.error("Error Updating Team");
    },
    onSuccess: () => {
      toast.success("Team Updated successfully");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      onClose();
    },
  });

  const onSubmit = (data: EditTeamFormInputs) => {
    if (team) {
      const updateData: Partial<EditTeamFormInputs> = {
        name: data.name,
      };

      mutation.mutate({ id: team.id, data: updateData });
    }
  };

  return (
    <Dialog open={!!team} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-6">
              <Button onClick={onClose} type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Updating Team" : "Update Team"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeamForm;

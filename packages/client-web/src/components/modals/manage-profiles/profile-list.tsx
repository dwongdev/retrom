import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@retrom/ui/components/accordion";
import { Button } from "@retrom/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@retrom/ui/components/dialog";
import {
  Emulator,
  EmulatorProfile,
} from "@retrom/codegen/retrom/models/emulators_pb";
import { Edit, PlusIcon, Trash } from "lucide-react";
import { EditProfileDialog } from "./edit-profile-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@retrom/ui/components/table";
import { Badge } from "@retrom/ui/components/badge";
import { useDeleteEmulatorProfiles } from "@/mutations/useDeleteEmulatorProfile";

type Props = {
  emulator: Emulator;
  profiles: EmulatorProfile[];
};

export function ProfileList(props: Props) {
  const { emulator, profiles } = props;

  const { mutate: deleteProfile } = useDeleteEmulatorProfiles();

  return (
    <AccordionItem value={emulator.id.toString()}>
      <AccordionTrigger className="text-lg">{emulator.name}</AccordionTrigger>

      <AccordionContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full flex gap-1" variant="secondary">
              <PlusIcon className="h-[1rem] w-[1rem]" /> Create New Profile
            </Button>
          </DialogTrigger>

          <EditProfileDialog emulator={emulator} />
        </Dialog>

        <Table className="w-full">
          <TableHeader>
            <TableRow className="*:whitespace-nowrap">
              <TableHead>Name</TableHead>
              <TableHead>File Extensions</TableHead>
              <TableHead>Custom Arguments</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {profiles.map((profile) => (
              <TableRow
                key={profile.id}
                className="border-none even:bg-secondary/20"
              >
                <TableCell className="w-auto min-w-[100px]">
                  {profile.name}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {profile.supportedExtensions.map((ext) => (
                      <Badge key={ext} variant="secondary">
                        {ext}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <pre className="w-[95%] break-all whitespace-normal">
                    {profile.customArgs.join(" ")}
                  </pre>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="secondary">
                          <Edit className="w-[1rem] h-[1rem]" />
                        </Button>
                      </DialogTrigger>

                      <EditProfileDialog
                        emulator={emulator}
                        existingProfile={profile}
                      />
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="destructive">
                          <Trash className="w-[1rem] h-[1rem]" />
                        </Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>Delete Profile</DialogHeader>
                        Are you sure you want to delete the profile{" "}
                        {profile.name}?
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                          </DialogClose>
                          <Button
                            variant="destructive"
                            onClick={() => deleteProfile({ ids: [profile.id] })}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {profiles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No profiles found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </AccordionContent>
    </AccordionItem>
  );
}

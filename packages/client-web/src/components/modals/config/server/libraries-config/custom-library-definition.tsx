import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@retrom/ui/components/popover";
import {
  ControllerFieldState,
  ControllerRenderProps,
  useWatch,
} from "@retrom/ui/components/form";
import { LibrariesSchema } from ".";
import { Button } from "@retrom/ui/components/button";
import { Settings2 } from "lucide-react";
import { Input } from "@retrom/ui/components/input";
import { FormControl, FormItem, FormMessage } from "@retrom/ui/components/form";
import { z } from "zod";
import { cn } from "@retrom/ui/lib/utils";
import { useLayoutEffect, useMemo } from "react";
import { Separator } from "@retrom/ui/components/separator";
import { ScrollArea } from "@retrom/ui/components/scroll-area";
import { StorageType } from "@retrom/codegen/retrom/server/config_pb";

export function CustomLibraryDefinitionInput<
  Field extends ControllerRenderProps<
    LibrariesSchema,
    `contentDirectories.${number}.customLibraryDefinition.definition`
  >,
>(props: { field: Field; fieldState: ControllerFieldState; index: number }) {
  const { field, fieldState, index } = props;

  const storageType = useWatch<LibrariesSchema>({
    name: `contentDirectories.${index}.storageType`,
  });

  useLayoutEffect(() => {
    if (storageType !== StorageType.CUSTOM && field.value) {
      field.onChange("");
    }
  }, [storageType, index, field]);

  return (
    <Popover>
      <FormItem>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            className={cn(
              "flex gap-2 sm:min-h-0 sm:w-min sm:h-min sm:p-2",
              !field.disabled && fieldState.error && "ring-2 ring-destructive",
            )}
            disabled={field.disabled}
          >
            <span className="sm:hidden">Configure Library Structure</span>
            <Settings2 className="h-[1rem] w-[1rem]" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-dvw sm:w-auto sm:max-w-[60ch] max-h-[80dvh] flex flex-col">
          <h3 className="text-lg font-extrabold">Library Structure</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This describes how your library is structured, allowing Retrom to
            automatically scan for content. Read the{" "}
            <a
              className="text-accent-text underline"
              href="https://github.com/JMBeresford/retrom/wiki/Library-Structure#custom"
              target="_blank"
            >
              documentation
            </a>{" "}
            to learn more.
          </p>

          <div className="flex gap-2">
            <FormControl>
              <Input
                {...field}
                autoComplete="off"
                placeholder="ex: {library}/{platform}/{gameFile}"
              />
            </FormControl>

            <PopoverClose asChild>
              <Button>Done</Button>
            </PopoverClose>
          </div>
          <FormMessage />

          {field.value && fieldState.error === undefined ? (
            <ExampleStructure value={field.value} />
          ) : null}
        </PopoverContent>
      </FormItem>
    </Popover>
  );
}

const builtinMacros = ["{library}", "{platform}", "{gameFile}", "{gameDir}"];

function ExampleStructure(props: { value: string }) {
  const { value } = props;
  const parts = useMemo(() => {
    const parts = value.split("/");
    if (parts.includes("{gameDir}")) {
      parts.push("{gameFile}");
    }

    return parts;
  }, [value]);

  function Entry(props: { depth: number }) {
    const { depth } = props;
    const part = parts.at(depth);

    if (part === undefined) {
      return null;
    }

    const name = part.replace("{", "").replace("}", "");
    const builtIn = builtinMacros.includes(part);
    const custom = !builtIn && part.startsWith("{") && part.endsWith("}");

    function Indentation() {
      return (
        <span
          className={cn(
            "flex h-1/2 before:w-full before:bg-border before:h-px items-end pb-px",
            depth && "w-[1ch] mr-[1ch]",
          )}
        />
      );
    }

    function File() {
      return (
        <span className="flex">
          <Indentation />
          <span>gameFile.rom</span>
        </span>
      );
    }

    function Directory() {
      return (
        <span className="flex flex-col">
          <span className="flex">
            <Indentation />
            {name}
            <span
              className={cn(
                (builtIn || custom) && "text-accent-text font-bold",
              )}
            >
              /
            </span>
          </span>

          <span className={cn("flex flex-col", depth && "*:ml-[2ch]")}>
            <span className="border-l-[1px]">
              <Entry depth={depth + 1} />
            </span>
            <span
              className={cn(
                "relative before:absolute",
                "before:h-[1ch] before:w-px before:bg-border",
              )}
            >
              <Entry depth={depth + 1} />
            </span>
          </span>
        </span>
      );
    }

    return (
      <span
        className={cn(
          "flex text-muted-foreground font-thin",
          (builtIn || custom) && "text-foreground font-normal",
        )}
      >
        {part === "{gameFile}" ? <File /> : <Directory />}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-4 overflow-hidden">
      <Separator className="mb-2" />
      <p className="text-sm italic">
        Example library based on the current value:
      </p>

      <ScrollArea className="flex flex-col bg-muted p-2 rounded-sm" type="auto">
        <pre className={cn("flex flex-col text-foreground text-sm")}>
          <Entry depth={0} />
        </pre>
      </ScrollArea>
    </div>
  );
}

export const libraryDefinitionValidator = z.object({
  definition: z.literal("").or(
    z
      .string()
      .refine(
        (value) =>
          value.startsWith("{library}") || value.startsWith("{platform}"),
        { message: "Must start with {library} or {platform}" },
      )
      .refine((value) => value.includes("{platform}"), {
        message: "Must contain {platform}",
      })
      .refine(
        (value) => value.includes("{gameFile}") || value.includes("gameDir"),
        {
          message: "Must contain {gameFile} or {gameDir}",
        },
      )
      .refine(
        (value) =>
          !(value.includes("{gameFile}") && value.includes("{gameDir}")),
        {
          message: "Cannot contain both {gameFile} and {gameDir}",
        },
      )
      .refine(
        (value) => {
          const gamePos = value.includes("{gameFile}")
            ? value.indexOf("{gameFile}")
            : value.indexOf("{gameDir}");

          const platformPos = value.indexOf("{platform}");

          return gamePos > platformPos;
        },
        { message: "{platform} must be before {gameDir} or {gameFile}" },
      )
      .refine(
        (value) =>
          builtinMacros.every((macro) => value.split(macro).length <= 2),
        (value) => {
          const macro = builtinMacros.find(
            (macro) => value.split(macro).length > 2,
          );

          return { message: `Must contain at most one ${macro}` };
        },
      )
      .refine(
        (value) => {
          for (let i = 0; i < value.length; i++) {
            const char = value[i];

            if (char === "{" && i !== 0 && value[i - 1] !== "/") {
              return false;
            }

            if (char === "}" && i + 1 > value.length && value[i + 1] !== "/") {
              return false;
            }
          }

          return true;
        },
        {
          message:
            "Macros must not be immediately followed or preceeded by anything but '/'",
        },
      )
      .refine((value) => !value.endsWith("/") && !value.startsWith("/"), {
        message: "Cannot end with a slash",
      })
      .refine((value) => !value.includes("//"), {
        message: "Cannot contain empty sections between slashes",
      })
      .refine(
        (value) => value.endsWith("{gameFile}") || value.endsWith("{gameDir}"),
        {
          message: "Must end with {gameFile} or {gameDir}",
        },
      ),
  ),
});

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@retrom/ui/components/sheet";
import { MenuEntryButton } from "../menubar/menu-entry-button";
import { HotkeyButton } from "../hotkey-button";
import { useUninstallGame } from "@/mutations/useUninstallGame";
import { useGameDetail } from "@/providers/game-details";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { FocusContainer } from "../focus-container";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useInstallationQuery } from "@/queries/useInstallationQuery";
import { InstallationStatus } from "@retrom/codegen/retrom/client/client-utils_pb";

export function UninstallGameAction() {
  const [open, setOpen] = useState(false);
  const { game } = useGameDetail();

  const { data: installationStatus } = useInstallationQuery(game);
  const { mutate: uninstall, status } = useUninstallGame(game);
  const openDisabled = installationStatus !== InstallationStatus.INSTALLED;

  const disabled =
    status === "pending" || installationStatus !== InstallationStatus.INSTALLED;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <MenuEntryButton
          id="uninstall-game-action-open"
          focusOpts={{ focusable: !openDisabled }}
          disabled={openDisabled}
        >
          Uninstall Game
        </MenuEntryButton>
      </SheetTrigger>

      <SheetContent
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <HotkeyLayer
          allowBubbling="never"
          handlers={{
            BACK: { handler: () => setOpen(false) },
            MENU: {
              handler: () => uninstall(),
            },
          }}
        >
          <FocusContainer
            opts={{ focusKey: "uninstall-game-action", isFocusBoundary: true }}
          >
            <SheetHeader>
              <SheetTitle>Uninstall Game</SheetTitle>
              <SheetDescription>
                Are you sure you want to uninstall this game?
              </SheetDescription>
            </SheetHeader>

            <SheetFooter>
              <SheetClose asChild>
                <HotkeyButton hotkey="BACK">Back</HotkeyButton>
              </SheetClose>

              <HotkeyButton
                disabled={disabled}
                hotkey="MENU"
                onClick={() => uninstall()}
              >
                {status === "pending" ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Confirm"
                )}
              </HotkeyButton>
            </SheetFooter>
          </FocusContainer>
        </HotkeyLayer>
      </SheetContent>
    </Sheet>
  );
}

import React from "react";
import { RotateCcw } from "lucide-react";
import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import AlertDialogBox from "./ui/alert-dialog";

const RestartApplication = ({ disable }: { disable: boolean | undefined }) => {
  const { restartApplication } = useRentalApplicationContext();

  const handleRestart = () => {
    restartApplication();
  };

  return (
    <div>
      <AlertDialogBox
        title={"Are you sure?"}
        description="You will lose all your progress including all the documents you
              uploaded"
        proceedBtnText="Yes, restart application"
        onProceed={handleRestart}
      >
        <button
          disabled={disable}
          className="flex gap-2 px-4 py-2 border border-[ring-offset-color] hover:bg-accent hover:text-accent-foreground ring-offset-background rounded transition-colors"
        >
          <RotateCcw /> Restart Application
        </button>
      </AlertDialogBox>
    </div>
  );
};

export default RestartApplication;

import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Toast, ToastProvider, ToastTitle, ToastViewport } from "./ui/toast";
import { Appointment } from "@/types";

const ContactForm = ({
  onSubmit,
  open,
  onOpen,
  showResponse,
}: {
  onSubmit: (formData: Appointment) => void;
  open: boolean;
  showResponse: boolean;
  onOpen: (open: boolean) => void;
}) => {
  const [showToast, setShowToast] = useState(false);
  const timerRef = React.useRef(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.message) return;
    onSubmit(formData);
    setFormData({ name: "", email: "", message: "" });
  };
  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);
  return (
    <ToastProvider swipeDirection="right">
      <Dialog open={open} onOpenChange={onOpen}>
        {showResponse ? (
          <DialogContent className="text-gray-500 w-[80%]">
            <DialogTitle className=" text-green-600 font-medium text-lg">
              Email Sent
            </DialogTitle>
            Your Response has been received. Following up for viewing is
            entirely up to the landlord. Thank you
          </DialogContent>
        ) : (
          <DialogContent className="w-[80%] rounded-lg">
            <DialogTitle className="text-center font-medium text-lg">
              Request Viewing
            </DialogTitle>

            <form onSubmit={submitHandler} className="space-y-5">
              <input
                type="text"
                name="name"
                value={formData.name}
                placeholder="Name"
                aria-required
                required
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${"border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <input
                type="email"
                name="email"
                aria-required
                required
                value={formData.email}
                placeholder="Email Address"
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${"border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <textarea
                placeholder="What day and time will work best for you..."
                rows={5}
                cols={10}
                value={formData.message}
                name="message"
                aria-required
                required
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${"border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              ></textarea>
              <Button
                className="bg-blue-600 hover:bg-blue-500 w-full"
                type="submit"
                /* onClick={() => {
                setShowToast(false);
                setTimeout(()=>{onOpen(false)},200);
                window.clearTimeout(timerRef.current);
                timerRef.current = window.setTimeout(() => {
                  setShowToast(true);
                }, 100);
              }} */
              >
                Send
              </Button>
            </form>

            <Toast
              className="ToastRoot"
              open={showToast}
              onOpenChange={setShowToast}
            >
              <ToastTitle>Email Sent</ToastTitle>
              <div>Success</div>
            </Toast>
          </DialogContent>
        )}
      </Dialog>
      {/* <ToastViewport/> */}
    </ToastProvider>
  );
};

export default ContactForm;

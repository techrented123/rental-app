import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Toast, ToastProvider, ToastTitle, ToastViewport } from "./ui/toast";
import { Appointment } from "@/types";
import { Calendar, Send } from "lucide-react";
const ContactForm = ({
  onSubmit,
  open,
  onOpen,
  showResponse,
  title,
}: {
  onSubmit: (formData: Appointment) => void;
  open: boolean;
  title: string;
  showResponse: boolean;
  onOpen: (open: boolean) => void;
}) => {
  const [showToast, setShowToast] = useState(false);
  const timerRef = React.useRef(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    move_in_date: "",
    phone_number: "",
  });
  const [focused, setFocused] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.email ||
      !formData.name ||
      !formData.message ||
      !formData.move_in_date
    )
      return;
    onSubmit(formData);
    setFormData({
      name: "",
      email: "",
      message: "",
      phone_number: "",
      move_in_date: "",
    });
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
              {title}
            </DialogTitle>

            <form onSubmit={submitHandler} className="space-y-5">
              <input
                type="text"
                name="name"
                value={formData.name}
                placeholder="Full Name"
                aria-required
                required
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${"border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />

              <div className="grid md:grid-cols-2 gap-2">
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
                <input
                  type="phone"
                  name="phone_number"
                  value={formData.phone_number}
                  placeholder="Phone"
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${"border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div className="flex items-center pr-1 rounded-md justify-between border focus:ring-2 focus:ring-blue-500 border-gray-300">
                <input
                  type={focused ? "date" : "text"}
                  name="move_in_date"
                  aria-required
                  onFocus={() => setFocused(true)}
                  onBlur={(e) => {
                    if (!e.target.value) setFocused(false);
                  }}
                  required
                  value={formData.move_in_date}
                  placeholder={focused ? "" : "Preferred Move-in Date"}
                  onChange={handleChange}
                  className="w-full pl-2 pr-0 py-2 bg-transparent outline-none"
                />
                {!focused && (
                  <span>
                    <Calendar size={15} />
                  </span>
                )}
              </div>

              <textarea
                placeholder="Leave us a message..."
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
                className="bg-blue-600 hover:bg-blue-500 w-full flex items-center gap-1"
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
                <Send size={15} />
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

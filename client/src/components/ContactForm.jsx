import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { LuContact } from "react-icons/lu";
import { Tooltip } from "antd";

export default function ContactForm() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const formEndPoint = "https://formspree.io/f/mwpbvogo";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(formEndPoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("SUCCESS");
        e.target.reset();
      } else {
        setStatus("ERROR");
      }
    } catch {
      setStatus("ERROR");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Tooltip title="Contact" placement="left">
          <button className="p-2 rounded border border-black shadow-lg">
            <LuContact size={30} />
          </button>
        </Tooltip>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-0 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.2 }}
                  aria-describedby="contact-description"
                >
                  <Dialog.Title className="text-lg font-semibold mb-2">
                    Contact Me
                  </Dialog.Title>
                  <Dialog.Description
                    id="contact-description"
                    className="sr-only"
                  >
                    Please fill out the form below to contact me.
                  </Dialog.Description>

                  <p className="text-sm mb-4">
                    Email: hettividun@gmail.com
                    <br />
                    Phone: +94 77 485 4207
                  </p>

                  <form className="space-y-3" onSubmit={handleSubmit}>
                    <input
                      name="name"
                      type="text"
                      placeholder="Your Name"
                      required
                      className="w-full border px-3 py-2 rounded"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Your Email"
                      required
                      className="w-full border px-3 py-2 rounded"
                    />
                    <textarea
                      name="message"
                      placeholder="Your Message"
                      required
                      className="w-full border px-3 py-2 rounded"
                    />
                    <button
                      type="submit"
                      className="w-full bg-purple-600 text-white py-2 rounded"
                    >
                      Send
                    </button>
                  </form>

                  <Dialog.Close asChild>
                    <button className="absolute top-3 right-3 text-gray-400 hover:text-black">
                      ✖
                    </button>
                  </Dialog.Close>

                  {status === "SUCCESS" && (
                    <p className="text-green-600 mt-2">
                      Thanks for your message!
                    </p>
                  )}
                  {status === "ERROR" && (
                    <p className="text-red-600 mt-2">
                      Oops! Something went wrong.
                    </p>
                  )}
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

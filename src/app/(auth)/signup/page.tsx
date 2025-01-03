"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Logo from "../../../../public/planner.svg";
import Loader from "@/components/global/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailCheck } from "lucide-react";
import { FormSchema } from "@/lib/types";
import { actionSignUpUser } from "@/lib/server-actions/auth-actions";
export const dynamic = "force-dynamic";

const SignUpFormSchema = z
  .object({
    email: z
      .string()
      .describe("Email")
      .email({ message: "Invalid Email" })
      .refine(
        (email) => {
          return email.endsWith("@cho.it");
        },
        {
          message: "Email deve provenire dal dominio @cho.it",
        }
      ),
    password: z
      .string()
      .describe("Password")
      .min(6, "La password deve contenere almeno 6 caratteri"),
    confirmPassword: z
      .string()
      .describe("Confirm Password")
      .min(6, "La password deve contenere almeno 6 caratteri"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

const Signup = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  const codeExchangeError = useMemo(() => {
    if (!searchParams) return "";
    return searchParams.get("error_description");
  }, [searchParams]);

  const confirmationAndErrorStyles = useMemo(
    () =>
      clsx("bg-primary", {
        "bg-red-500/10": codeExchangeError,
        "border-red-500/50": codeExchangeError,
        "text-red-700": codeExchangeError,
      }),
    [codeExchangeError]
  );

  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async ({ email, password }: z.infer<typeof FormSchema>) => {
    console.log("Sono qui");
    const { error } = await actionSignUpUser({ email, password });
    if (error) {
      setSubmitError(error.message);
      form.reset();
      return;
    }
    setConfirmation(true);
  };

  return (
      <Form {...form}>
        <form
          onChange={() => {
            if (submitError) setSubmitError("");
          }}
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full sm:justify-center sm:w-[400px]
        space-y-6 flex
        flex-col
        "
        >
          <Link
            href="/"
            className="
          w-full
          flex
          justify-left
          items-center"
          >
            <Image
              src={Logo}
              alt="Computer House Planner"
              width={90}
              height={30}
            />
            <span
              className="font-semibold
          dark:text-white text-4xl first-letter:ml-2"
            >
              planner.
            </span>
          </Link>
          <FormDescription
            className="
        text-foreground/60"
          >
            Una piattaforma all-in-one per la collaborazione e la produttività
          </FormDescription>
          {!confirmation && !codeExchangeError && (
            <>
              <FormField
                disabled={isLoading}
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full p-6" disabled={isLoading}>
                {!isLoading ? "Crea un account" : <Loader />}
              </Button>
            </>
          )}

          {submitError && <FormMessage>{submitError}</FormMessage>}
          <span className="self-container">
            Hai già un account?{" "}
            <Link href="/login" className="text-primary">
              Login
            </Link>
          </span>
          {(confirmation || codeExchangeError) && (
            <>
              <Alert className={confirmationAndErrorStyles}>
                {!codeExchangeError && <MailCheck className="h-4 w-4" />}
                <AlertTitle>
                  {codeExchangeError
                    ? "Link invalido."
                    : "Controlla la tua mail."}
                </AlertTitle>
                <AlertDescription>
                  {codeExchangeError || "È stata inviata una mail di conferma."}
                </AlertDescription>
              </Alert>
            </>
          )}
        </form>
      </Form>
  );
};

export default Signup;

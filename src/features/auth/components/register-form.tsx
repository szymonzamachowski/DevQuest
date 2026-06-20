"use client";

import { useFormState } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction, type RegisterState } from "@/features/auth/actions/register.action";

const initialState: RegisterState = { ok: false };

export function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" autoComplete="name" placeholder="Optional" />
        {state.ok === false && state.fieldErrors?.name?.length ? (
          <p className="text-sm text-[var(--dq-error)]">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" />
        {state.ok === false && state.fieldErrors?.email?.length ? (
          <p className="text-sm text-[var(--dq-error)]">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" />
        {state.ok === false && state.fieldErrors?.password?.length ? (
          <p className="text-sm text-[var(--dq-error)]">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
        />
        {state.ok === false && state.fieldErrors?.confirmPassword?.length ? (
          <p className="text-sm text-[var(--dq-error)]">{state.fieldErrors.confirmPassword[0]}</p>
        ) : null}
      </div>

      {state.ok === false && state.formError ? (
        <p className="text-sm text-[var(--dq-error)]">{state.formError}</p>
      ) : null}

      <Button type="submit" className="h-11 w-full">
        Create account
      </Button>
    </form>
  );
}

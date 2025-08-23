"use client";

import { useAuthContext } from "@/auth/hooks";
import { Button } from "@workspace/ui/components/button";

export default function Page() {
  const { user } = useAuthContext();

  return (
    <div>
      <p>{user?.name}</p>
      <Button>Add</Button>
      <p className="text-red-500">hello</p>
    </div>
  );
}

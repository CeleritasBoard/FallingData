import { Card, CardContent } from "@workspace/ui/src/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  BadgePlus,
  CircleCheckBig,
  FlaskConical,
  ShieldQuestion,
} from "lucide-react";

export type UserStatus = "NEW" | "TEST" | "CONFIRMED" | "?";

export interface IUserParams {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  status: UserStatus;
}

function StatusBadge({ status }: { status: UserStatus }) {
  switch (status) {
    case "NEW":
      return <BadgePlus />;
    case "TEST":
      return <FlaskConical />;
    case "CONFIRMED":
      return <CircleCheckBig />;
    case "?":
    default:
      return <ShieldQuestion />;
  }
}

export function UserItem({ data }: { data: IUserParams }) {
  return (
    <Card className="bg-white text-black max-w-[400px]">
      <CardContent className=" flex flex-row">
        <Avatar className=" h-[96px] w-[96px] rounded-full mr-4">
          <AvatarImage
            src={data.avatar || "/placeholder.svg"}
            alt={data.name}
          />
          <AvatarFallback className="rounded-lg">??</AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-1">
          <p style={{ fontWeight: "bold" }}>{data.name}</p>
          <p>{data.email}</p>
          <div className="flex flex-row">
            <span className="mr-2">
              <StatusBadge status={data.status} />
            </span>
            {data.status}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

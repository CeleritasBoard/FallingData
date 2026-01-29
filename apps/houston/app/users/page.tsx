import { UserItem, type IUserParams } from "./user-item";

export default async function UsersPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Felhasználók
        </h1>
      </div>
      <div className="grid-flow-row grid-cols-5">
        <UserItem
          data={{
            id: "",
            avatar: "https://github.com/shadcn.png",
            name: "Some User",
            email: "email@address.com",
            status: "NEW",
          }}
        />
      </div>
    </div>
  );
}

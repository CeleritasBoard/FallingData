import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";

export default async function Home() {
  return (
    <div>
      <h1>Welcome to Houston</h1>

      <Alert variant="destructive">
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components and dependencies to your app using the cli.
        </AlertDescription>
      </Alert>
    </div>
  );
}

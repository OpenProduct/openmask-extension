import { Component, ErrorInfo, ReactNode } from "react";
import { ErrorMessage } from "../../components/Components";
import { NotificationView } from "../Loading";

interface Props {
  onClose: () => void;
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <NotificationView action={this.props.onClose} button="Cancel">
          {this.state.error && (
            <ErrorMessage>{this.state.error.message}</ErrorMessage>
          )}
        </NotificationView>
      );
    }

    return this.props.children;
  }
}

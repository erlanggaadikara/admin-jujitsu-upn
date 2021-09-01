import { Suspense } from "react";
import { observer } from "mobx-react-lite";
import Spinner from "component/Spinner";

export default ({ children }) => {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
};

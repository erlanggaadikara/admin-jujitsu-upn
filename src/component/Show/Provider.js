import Loading from "component/Show/Loading";
import Alert from "component/Show/Alert";
import Toast from "component/Show/Toast";
import { observer } from "mobx-react-lite";

export default observer(() => {
  return (
    <>
      <Alert />
      <Loading />
      <Toast />
    </>
  );
});

import { observer, useLocalObservable } from "mobx-react-lite";
import { action, runInAction } from "mobx";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormHelperText,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
} from "@material-ui/core";
import { DataGrid } from "@mui/x-data-grid";
import { Get, Post } from "utils/api";
import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import Spinner from "component/Spinner";
import { toast } from "component/Show/Toast";

export default observer(() => {
  const meta = useLocalObservable(() => ({
    value: "",
    load: true,
  }));
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  const form = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      const kepengurusan = await Get("/kepengurusan");
      const member = await Get("/member");
      const jabatan = await Get("/jabatan");
      if (kepengurusan && member && jabatan) {
        let columns = [
          {
            field: "member_id",
            headerName: "Nama",
            minWidth: 300,
            valueGetter: (params) => {
              const checkMember = member.find((x) => x.id == params.value);
              return checkMember.member_nama;
            },
          },
          {
            field: "jabatan_id",
            headerName: "Jabatan",
            minWidth: 150,
            valueGetter: (params) => {
              const checkJabatan = jabatan.find((x) => x.id == params.value);
              return checkJabatan.jabatan_nama;
            },
          },
          {
            field: "kepengurusan_tahun",
            headerName: "Tahun",
            minWidth: 150,
          },
        ];

        setColumns([...columns]);
        setRows([...kepengurusan]);

        runInAction(() => {
          meta.load = false;
        });
      }
    };

    fetch();
  }, []);

  if (meta.load) return <Spinner />;

  return (
    <Box sx={{ height: "90vh", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ my: 2 }}>
          Kepengurusan
        </Typography>
        {meta.value ? (
          <Box
            sx={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              color="success"
              size="medium"
              sx={{ my: 2, px: 4, mr: 1 }}
              onClick={() => form.current && form.current.click()}
            >
              Simpan
            </Button>
            <Button
              variant="contained"
              color="error"
              size="medium"
              sx={{ my: 2, px: 4, mr: 1 }}
              type="button"
              onClick={action(() => (meta.value = ""))}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              color="success"
              size="medium"
              sx={{ my: 2, px: 4, mr: 1 }}
              onClick={action(
                () =>
                  (meta.value = {
                    type: "new",
                    member_id: 0,
                    jabatan_id: 0,
                    kepengurusan_tahun: 0,
                  })
              )}
            >
              Baru
            </Button>
          </Box>
        )}
      </Box>
      {!meta.value ? (
        <DataGrid
          rows={rows}
          columns={columns}
          onCellClick={action(
            (params) => (meta.value = { type: "update", ...params.row })
          )}
        />
      ) : (
        <FormField data={meta.value} formRef={form} />
      )}
    </Box>
  );
});

const FormField = observer(({ data, formRef }) => {
  const meta = useLocalObservable(() => ({
    member: [],
    jabatan: [],
  }));
  const validationSchema = yup.object({
    member_id: yup.number().required("Mohon diisi"),
    jabatan_id: yup.number().required("Mohon diisi"),
    kepengurusan_tahun: yup.number().required("Mohon diisi"),
  });

  const formik = useFormik({
    initialValues: {
      member_id: data.member_id || "",
      jabatan_id: data.jabatan_id || "",
      kepengurusan_tahun: data.kepengurusan_tahun || "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await submitEvent(data.type, values);
    },
  });

  const createNew = async (value) => {
    console.log("new", value);
    const cn = await Post("/kepengurusan/insert", {
      ...value,
      tahun_kepengurusan: value.kepengurusan_tahun,
    });

    console.log("new", cn);
    if (cn) {
      toast.show("Berhasil", "Input Data Berhasil", "SUCCESS");
    } else {
      toast.show("Gagal", "Input Data Gagal", "ERROR");
    }
  };

  const updateData = async (value) => {
    console.log("update", value);
  };

  const deleteData = async (value) => {
    console.log("delete", value);
  };

  const submitEvent = async (type, value) => {
    if (type == "new") {
      await createNew(value);
    } else if (type == "update") {
      await updateData(value);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const member = await Get("/member");
      const jabatan = await Get("/jabatan");
      if (member && jabatan) {
        runInAction(() => {
          meta.member = member;
          meta.jabatan = jabatan;
        });
      }
    };

    fetch();
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
      component="form"
      onSubmit={formik.handleSubmit}
    >
      <FormControl
        fullWidth
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
        error={formik.touched.member_id && Boolean(formik.errors.member_id)}
      >
        <InputLabel id="demo-simple-select-helper-label">
          Nama Member *
        </InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          label="Status *"
          name="member_id"
          value={formik.values.member_id}
          onChange={formik.handleChange}
          color="primary"
        >
          {meta.member.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.member_nama}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {formik.touched.member_id && formik.errors.member_id}
        </FormHelperText>
      </FormControl>
      <FormControl
        fullWidth
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
        error={formik.touched.jabatan_id && Boolean(formik.errors.jabatan_id)}
      >
        <InputLabel id="demo-simple-select-helper-label">Jabatan*</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          label="Status *"
          name="jabatan_id"
          value={formik.values.jabatan_id}
          onChange={formik.handleChange}
          color="primary"
        >
          {meta.jabatan.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.jabatan_nama}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {formik.touched.jabatan_id && formik.errors.jabatan_id}
        </FormHelperText>
      </FormControl>
      <TextField
        label="Tahun *"
        name="kepengurusan_tahun"
        variant="outlined"
        color="primary"
        fullWidth
        value={formik.values.kepengurusan_tahun}
        onChange={formik.handleChange}
        error={
          formik.touched.kepengurusan_tahun &&
          Boolean(formik.errors.kepengurusan_tahun)
        }
        helperText={
          formik.touched.kepengurusan_tahun && formik.errors.kepengurusan_tahun
        }
        sx={{ my: 1, mr: 1, width: { laptop: "45%", mobile: "90%" } }}
      />
      <Button sx={{ display: "none" }} type="submit" ref={formRef} />
    </Box>
  );
});

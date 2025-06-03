"use client";
import { JSX, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RegisterDateInfo, url } from "@/app/utils";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Register(): JSX.Element {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState<boolean>(false);

  const registerForm = useFormik({
    initialValues: {
      name: "",
      surname: "",
      username: "",
      password: "",
      email: "",
      phoneNumber: "",
      month: "",
      day: 0,
      year: 0,
      createdOn: new Date(),
      birthDate: new Date(),
    },
    validationSchema: Yup.object({
      name: Yup.string().max(32).required("Required"),
      surname: Yup.string().max(32).required("Required"),
      username: Yup.string().min(5).max(16).required("Required"),
      password: Yup.string()
        .min(5)
        .max(16)
        .required("Required")
        .max(16)
        .required("Required")
        .matches(
          /^.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*$/,
          "Need one special character"
        ),
      email: Yup.string().email().max(32).required("Required"),
      month: Yup.string().required("Required"),
      day: Yup.number().required("Required"),
      year: Yup.number().required("Required"),
      phoneNumber: Yup.string().max(9).required("Required"),
      createdOn: Yup.date().required("Required"),
      birthDate: Yup.date().required("Required"),
    }),
    onSubmit: async (values) => {
      values = {
        ...values,
        birthDate: new Date(
          values.year,
          RegisterDateInfo(values.year).months.findIndex(
            (month: string) => month === values.month
          ),
          values.day
        ),
      };
      const { day, month, year, ...registerValues } = values;

      try {
        const response = await axios.post(`${url}/users`, {
          ...registerValues,
        });
        console.log(response.status);
        router.push("/");
      } catch {
        console.error("Error while registering");
      }
    },
  });
  return (
    <form
      className="account-detail-container"
      onSubmit={registerForm.handleSubmit}
    >
      {!isClicked ? (
        <>
          <div className="account-details">
            <input
              type="text"
              placeholder="Name"
              {...registerForm.getFieldProps("name")}
            />
            <input
              type="text"
              placeholder="E-mail"
              {...registerForm.getFieldProps("email")}
            />
          </div>
          <div className="birth-date-details">
            <span>
              <strong>Birth Date</strong>
            </span>
            <label>
              <span>Month</span>
              <select
                name="month"
                id="month"
                onChange={registerForm.handleChange}
                onBlur={registerForm.handleBlur}
                value={registerForm.values.month}
              >
                {registerForm.values.year &&
                  RegisterDateInfo(registerForm.values.year).months.map(
                    (month: string) => <option key={month}>{month}</option>
                  )}
              </select>
            </label>
            <label>
              <span>Day</span>
              <select
                name="day"
                id="day"
                onChange={registerForm.handleChange}
                onBlur={registerForm.handleBlur}
                value={registerForm.values.day}
              >
                {registerForm.values.month &&
                  registerForm.values.year &&
                  RegisterDateInfo(registerForm.values.year).days[
                    registerForm.values.month
                  ].map((day: number) => <option key={day}>{day}</option>)}
              </select>
            </label>
            <label>
              <span>Year</span>
              <select
                name="year"
                id="year"
                onChange={registerForm.handleChange}
                onBlur={registerForm.handleBlur}
                value={registerForm.values.year}
              >
                {RegisterDateInfo(registerForm.values.year).years.map(
                  (year: number) => (
                    <option key={year}>{year}</option>
                  )
                )}
              </select>
            </label>
          </div>
          <button
            type="button"
            disabled={
              !registerForm.values.name ||
              !registerForm.values.email ||
              !registerForm.values.year ||
              !registerForm.values.month ||
              !registerForm.values.day
            }
            onClick={() => setIsClicked((previous: boolean) => !previous)}
          >
            Next
          </button>
        </>
      ) : (
        <>
          <div>
            <div className="account-details">
              <span>Surname</span>
              <input
                type="text"
                placeholder="Enter surname"
                {...registerForm.getFieldProps("surname")}
              />
            </div>
            <div className="account-details">
              <span>Phone number</span>
              <input
                type="text"
                placeholder="Enter phone number"
                {...registerForm.getFieldProps("phoneNumber")}
              />
            </div>
            <div className="account-details">
              <span>Username</span>
              <input
                type="text"
                placeholder="Enter username"
                {...registerForm.getFieldProps("username")}
              />
            </div>
            <div className="account-details">
              <span>Password</span>
              <input
                type="password"
                placeholder="Enter password"
                {...registerForm.getFieldProps("password")}
              />
            </div>
          </div>
          <button
            onClick={() => setIsClicked((previous: boolean) => !previous)}
          >
            Go back
          </button>
          <button
            type="submit"
            disabled={
              !registerForm.values.surname ||
              !registerForm.values.phoneNumber ||
              !registerForm.values.username ||
              !registerForm.values.password
            }
          >
            Sign up
          </button>
        </>
      )}
    </form>
  );
}

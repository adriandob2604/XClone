"use client";
import { JSX, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RegisterDateInfo } from "./utils";
import axios from "axios";
export interface AccountDetails {
  name: string;
  email: string;
  month: string;
  day: number;
  year: number;
  createdOn: Date;
}
export default function Register(): JSX.Element {
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [initialInfo, setInitialInfo] = useState<AccountDetails>({
    name: "",
    email: "",
    month: "",
    day: 0,
    year: 0,
    createdOn: new Date(),
  });
  const initialForm = useFormik({
    initialValues: {
      name: "",
      email: "",
      month: "",
      day: 0,
      year: 0,
      createdOn: new Date(),
    },
    validationSchema: Yup.object({
      name: Yup.string().max(32).required("Required"),
      email: Yup.string().email().max(32).required("Required"),
      month: Yup.string().required("Required"),
      day: Yup.number().required("Required"),
      year: Yup.number().required("Required"),
      createdOn: Yup.date(),
    }),
    onSubmit: (values) => {
      setInitialInfo(values);
    },
  });
  const registerForm = useFormik({
    initialValues: {
      surname: "",
      phoneNumber: "",
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      surname: Yup.string().max(32).required("Required"),
      phoneNumber: Yup.string().max(9).required("Required"),
      username: Yup.string().max(16).required("Required"),
      password: Yup.string().max(16).required("Required"),
    }),
    onSubmit: (values) => {
      if (initialInfo) {
        try {
          axios
            .post("/accounts", { ...initialInfo, ...values })
            .then((response) => response.status)
            .catch((error) =>
              console.log("Error while creating an account", error)
            );
        } catch {
          console.log("Error while fetching data");
        }
      }
    },
  });

  return (
    <>
      {!isClicked ? (
        <form onSubmit={initialForm.handleSubmit}>
          <div className="account-details">
            <input
              type="text"
              placeholder="Name"
              {...initialForm.getFieldProps("name")}
            />
            <input
              type="text"
              placeholder="E-mail"
              {...initialForm.getFieldProps("email")}
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
                onChange={initialForm.handleChange}
                onBlur={initialForm.handleBlur}
                value={initialForm.values.month}
              >
                {initialForm.values.year &&
                  RegisterDateInfo(initialForm.values.year).months.map(
                    (month: string) => <option key={month}>{month}</option>
                  )}
              </select>
            </label>
            <label>
              <span>Day</span>
              <select
                name="day"
                id="day"
                onChange={initialForm.handleChange}
                onBlur={initialForm.handleBlur}
                value={initialForm.values.day}
              >
                {initialForm.values.month &&
                  initialForm.values.year &&
                  RegisterDateInfo(initialForm.values.year).days[
                    initialForm.values.month
                  ].map((day: number) => <option key={day}>{day}</option>)}
              </select>
            </label>
            <label>
              <span>Year</span>
              <select
                name="year"
                id="year"
                onChange={initialForm.handleChange}
                onBlur={initialForm.handleBlur}
                value={initialForm.values.year}
              >
                {RegisterDateInfo(initialForm.values.year).years.map(
                  (year: number) => (
                    <option key={year}>{year}</option>
                  )
                )}
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={Object.values(initialForm.values).some(
              (value: string | number | Date) => !value
            )}
            onClick={() => setIsClicked((previous: boolean) => !previous)}
          >
            Next
          </button>
        </form>
      ) : (
        <form
          className="account-detail-container"
          onSubmit={registerForm.handleSubmit}
        >
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
        </form>
      )}
    </>
  );
}

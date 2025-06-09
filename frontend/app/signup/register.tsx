"use client";
import { JSX, useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RegisterDateInfo, url } from "@/app/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { KeycloakContext } from "../keycloakprovider";

export default function Register(): JSX.Element {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const { isAuthenticated } = useContext(KeycloakContext);
  const [emailAvailable, setEmailAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated]);

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
      phoneNumber: Yup.string()
        .matches(/^\d+$/, "Can contain only numbers")
        .min(9)
        .max(9)
        .required("Required"),
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
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (registerForm.values.email) {
        axios
          .post(`${url}/users/check-email`, {
            email: registerForm.values.email,
          })
          .then((response) => {
            if (response.status === 200) {
              setEmailAvailable(true);
            }
          })
          .catch(() => {
            setEmailAvailable(false);
          });
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [registerForm.values.email]);

  return (
    <form
      className="create-account-container"
      onSubmit={registerForm.handleSubmit}
    >
      {!isClicked ? (
        <>
          <div className="items-container">
            <button className="back-button" onClick={() => router.push("/")}>
              x
            </button>
            <h2>Create an account</h2>
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
            <strong>Birth Date</strong>
            <span className="create-account-information">
              This information won't be visible for other users. Enter your age,
              even if this account represents a company, a pet oraz any other
              person or thing.
            </span>
            <div className="birth-date-details">
              <span></span>
              <div className="birth-date-select">
                <label>Month</label>
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
              </div>
              <div className="birth-date-select">
                <label>Day</label>
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
              </div>
              <div className="birth-date-select">
                <label>Year</label>
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
              </div>
            </div>

            <button
              className="next-button"
              type="button"
              disabled={
                !registerForm.values.name ||
                !registerForm.values.email ||
                !registerForm.values.year ||
                !registerForm.values.month ||
                !registerForm.values.day ||
                !emailAvailable
              }
              onClick={() => setIsClicked((previous: boolean) => !previous)}
            >
              Next
            </button>
          </div>
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

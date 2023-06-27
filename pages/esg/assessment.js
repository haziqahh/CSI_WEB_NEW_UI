import { Button, Layout, Row, Col, Steps, Radio, Checkbox, Upload, message, Modal, Input } from "antd";
import Header from "./header";
import Footer from "../footer";
import { ExclamationCircleOutlined, LeftOutlined, PaperClipOutlined, RightCircleFilled, RightOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useRef } from "react";
import APIHelpers from "../api/apiHelper";
import { useRouter } from "next/router";
import { MSIC } from "../../compenents/config";
import SampleJpg from "../../assests/img/sample.png";

const { Content } = Layout;
const { Step } = Steps;
const alphabet = "abcdefghijklmnopqrstuvwxyz";

function AssessmentPage() {
  const router = useRouter();
  const [assessment, setAssessment] = useState([]);
  const [completedAssessment, setCompletedAssessment] = useState([]);
  const [fullCompletedAssessment, setFullCompletedAssessment] = useState([]);
  const [continueAssessment, setContinueAssessment] = useState({});
  const [currentProgress, setCurrentProgress] = useState(0);
  const [lastAssessment, setLastAssessment] = useState("");
  const [sme, setSme] = useState({});
  // const [assessment, setAssessment] = useState("");
  const [questionSet, setQuestionSet] = useState({});
  const [dimension, setDimension] = useState([]);
  const [question, setQuestion] = useState({});
  const [demographic, setDemographic] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [demoAnswer, setDemoAnswer] = useState([]);
  const [isoDoc, setIsoDoc] = useState([]);
  const [tempUploadDoc, setTempUploadDoc] = useState({});
  const [uploadDoc, setUploadDoc] = useState([]);
  const [tab, setTab] = useState(0);
  const [other, setOther] = useState({});
  const [created, setCreated] = useState(0);
  const [dimenDisplay, setDimenDisplay] = useState([]);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const questionStart = useRef();

  

  useEffect(() => {
    if (router.isReady) {
      getSME();
      getQuestionSet();
    }
  }, [router.isReady]);

  useEffect(() => {
    if (Object.keys(sme).length > 0 && Object.keys(questionSet).length > 0 && created === 0) {
      getAssessment();
      setCreated(created + 1);
    }
  }, [sme, questionSet]);

  useEffect(() => {
    if (Object.keys(questionSet).length > 0) {
      getQuestion();
    }
  }, [questionSet]);

  useEffect(() => {
    if (assessment !== "") {
      getAssessmentEntry();
    }
  }, [assessment]);

  const getSME = () => {
    APIHelpers.GET("v1/smes?id=" + router.query.id)
      .then((res) => {
        res.items[0].sector = MSIC.filter((item) => item.code === res.items[0].msic)[0].sector;
        setSme(res.items[0]);
      })
      .catch(() => {});
  };

  const getAssessment = () => {
    APIHelpers.GET("v1/assessments?smeId=" + router.query.id)
      .then((res) => {
        if (res.items !== null) {
          res.items = res.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          let last = res.items[0];
          if (last.completionDate === "0001-01-01T00:00:00Z") {
            setAssessment(last.id);
          } else {
            let lastDate = new Date(last.completionDate);
            let current = new Date();
            let months = Math.floor((current - lastDate) / (1000 * 60 * 60 * 24 * 30));
            if (months > 6) {
              createAssessment();
            } else {
              let nextDate = new Date(lastDate.setMonth(lastDate.getMonth() + 6));
              nextDate = ("0" + nextDate.getDate()).slice(-2) + "/" + ("0" + (nextDate.getMonth() + 1)).slice(-2) + "/" + nextDate.getFullYear();
              message.error({
                content: `You can take another ESG Assessment from ` + nextDate + ` onwards.`,
                style: {
                  fontSize: "20px",
                  marginTop: "100px",
                },
                duration: 8,
              });
              router.push("/esg/dashboard");
            }
          }
        } else {
          createAssessment();
        }
      })
      .catch(() => {});
  };

  const getAssessmentEntry = () => {
    APIHelpers.GET("v1/assessmentEntries?assessmentId=" + assessment)
      .then((res) => {
        let answer = [];
        let demo = [];
        res.items = res.items.sort((a, b) => new Date(a.question.createdAt) - new Date(b.question.createdAt));
        res.items.map((val) => {
          if (val.questionType === "PSYCHOGRAPHIC" || val.questionType === "UPLOAD") {
            val.assessmentEntryID = val.id;
            val.change = false;
            answer.push(val);
          } else {
            val.assessmentEntryID = val.id;
            val.change = false;
            demo.push(val);
          }
        });
        setAnswer(answer);
        setDemoAnswer(demo);
      })
      .catch(() => {});
  };

  const createAssessment = () => {
    let data = {
      smeID: router.query.id,
      questionSetID: questionSet.id,
    };
    APIHelpers.POST("v1/assessment", data)
      .then((res) => {
        setAssessment(res.item);
      })
      .catch(() => {});
  };

  const getQuestionSet = () => {
    APIHelpers.GET("v1/questionSets")
      .then((res) => {
        setQuestionSet(res.items[1]);
      })
      .catch(() => {});
  };

  const getQuestion = () => {
    APIHelpers.GET("v1/questions?questionSetId=" + questionSet.id)
      .then((res) => {
        let structure = new Object();
        let dimen = ["General"];
        let dimenDisplay = ["General"];
        let demo = [];
        let index = 0;
        res.items = res.items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        res.items.map((val, index1) => {
          if (val.questionType === "PSYCHOGRAPHIC" || val.questionType === "UPLOAD") {
            if (!dimen.includes(val.dimension)) {
              dimen.push(val.dimension);
              dimenDisplay.push(val.dimension);
            }
            if (!(val.dimension in structure)) {
              structure[val.dimension] = [];
            }
            val.questionNo = index + 1;
            index += 1;
            structure[val.dimension].push(val);
          } else {
            let question = {
              questionLabel: val.questionLabel,
              options: val.options,
            };
            demo.push(question);
          }
          if (index1 === res.items.length - 1) {
            setDimension(dimen);
            // let envIndex = dimenDisplay.indexOf("Environmental");
            // dimenDisplay[envIndex] = "Environment";
            setDimenDisplay(dimenDisplay);
            setQuestion(structure);
            setDemographic(demo);
          }
        });
      })
      .catch(() => {});
  };

  const showDemographics = () => (
    <Row className="flex flex-col">
      <p className="font-semibold text-2xl 1000:text-3xl text-formTitleGreen mb-4">{dimension[tab]}</p>
      {demographic.map((val, index) => (
        <div className="py-4">
          <p className="text-xl font-semibold mb-2">
            {alphabet[index]}. {val.questionLabel}
          </p>
          <Radio.Group
            className="flex flex-col ml-6"
            value={Object.keys(demoAnswer).length > 0 ? (demoAnswer[index].answer.text !== null ? demoAnswer[index].answer.text[0] : null) : null}
            onChange={(value) => {
              demoAnswer[index].answer.text = [value.target.value];
              demoAnswer[index].change = true;
              setDemoAnswer([...demoAnswer]);
            }}
          >
            {val.options.map((val1, index1) => (
              <Radio value={val1} className="text-lg">
                {val1}
              </Radio>
            ))}
          </Radio.Group>
        </div>
      ))}
    </Row>
  );

  const showQuestions = (value) => (
    <Row className="flex flex-col">
      <p className="font-semibold text-2xl 1000:text-2xl text-formTitleGreen my-4">{value}</p>
      {question[value].map((val) => (
        <div className="py-2 ml-2">
          <div className="flex gap-x-2">
            <p className="text-lg font-semibold mb-2">{val.questionNo}.</p>
            <p className="text-lg font-semibold mb-2">
              {val.questionLabel}
              <br />
              {val.questionType === "UPLOAD" && val.options.length > 2 ? (
                <p className="text-lg font-semibold mb-2 flex items-center text-assessmentNext">
                  Note: Please click on the&nbsp;
                  <PaperClipOutlined />
                  &nbsp;to attach supporting document(s) where applicable.
                </p>
              ) : null}
            </p>
          </div>

          {val.questionType !== "UPLOAD" ? (
            <Radio.Group
              className="flex flex-col ml-6"
              value={answer[val.questionNo - 1].respondStatus !== "TO_START" || answer[val.questionNo - 1].change === true ? answer[val.questionNo - 1].answer.scalar : null}
              onChange={(value) => {
                answer[val.questionNo - 1].answer.scalar = value.target.value;
                answer[val.questionNo - 1].change = true;
                setAnswer([...answer]);
              }}
            >
              <Radio value={true} className="text-lg">
                {val.options[0]}
              </Radio>
              <Radio value={false} className="text-lg">
                {val.options[1]}
              </Radio>
            </Radio.Group>
          ) : val.questionType === "UPLOAD" && val.options.length < 3 ? (
            <Radio.Group
              className="flex flex-col ml-6"
              value={answer[val.questionNo - 1].respondStatus !== "TO_START" || answer[val.questionNo - 1].change === true ? answer[val.questionNo - 1].answer.scalar : null}
              onChange={(value) => {
                answer[val.questionNo - 1].answer.scalar = value.target.value;
                answer[val.questionNo - 1].change = true;
                setAnswer([...answer]);
              }}
            >
              <Radio value={true} className="text-lg Radio-upload">
                {val.options[0]}
                <Upload {...docProps("3rd Party", dimension[tab])} className="flex justify-center Upload-clip">
                  <PaperClipOutlined />
                </Upload>
              </Radio>
              <Radio value={false} className="text-lg">
                {val.options[1]}
              </Radio>
            </Radio.Group>
          ) : (
            <div>
              {val.options
                .filter((value) => value !== "None")
                .map((val1, index1) => (
                  <div className="flex items-center gap-x-2 text-lg my-1">
                    <RightCircleFilled />
                    <p>{val1}</p>
                    {val1.includes("Others") ? (
                      <Input
                        className="w-1/3"
                        onChange={(value) => {
                          other[dimension[tab]] = value.target.value;
                          answer[val.questionNo - 1].change = true;
                          setAnswer([...answer]);
                          setOther(other);
                        }}
                      />
                    ) : null}
                    {!val1.includes("None") ? (
                      <Upload {...docProps(val1.includes("Others") ? dimension[tab] : val1, dimension[tab])} className="flex justify-center Upload-clip">
                        <PaperClipOutlined />
                      </Upload>
                    ) : null}
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}
    </Row>
  );

  const docProps = (value, dimen) => {
    if (!(dimen in tempUploadDoc)) {
      tempUploadDoc[dimen] = new Object();
      setTempUploadDoc(tempUploadDoc);
    }
    if (!(value in tempUploadDoc[dimen])) {
      tempUploadDoc[dimen][value] = [];
      setTempUploadDoc(tempUploadDoc);
    }
    return {
      name: "file",
      multiple: true,
      fileList: tempUploadDoc[dimen][value],
      maxCount: 1,
      beforeUpload: (file) => {
        if (file.type !== "application/pdf" && file.type !== "image/png" && file.type !== "image/jpg" && file.type !== "image/jpeg") {
          message.error({
            content: `${file.name} is an invalid file format. Please change the file extension to either .pdf, .png, .jpg, .jpeg.`,
            style: {
              fontSize: "20px",
              marginTop: "100px",
            },
            duration: 8,
          });
          return Upload.LIST_IGNORE;
        } else if (file.size > 5242880) {
          message.error({
            content: `${file.name} is too large. Please upload another document that is smaller than 5MB.`,
            style: {
              fontSize: "20px",
              marginTop: "100px",
            },
            duration: 8,
          });
          return Upload.LIST_IGNORE;
        } else {
          return true;
        }
      },
      onChange(info) {
        if (info.fileList.length > 0) {
          let files = tempUploadDoc;
          info.fileList[0].status = "done";
          files[dimen][value] = [info.fileList[0].originFileObj];
          setTempUploadDoc(files);
          setDemoAnswer([...demoAnswer]);
        }
      },
      onRemove() {
        tempUploadDoc[dimen][value] = [];
        setTempUploadDoc(tempUploadDoc);
        setDemoAnswer([...demoAnswer]);
      },
    };
  };

  const saveAsDraft = () => {
    // if(Object.keys(other).length > 0) {
    //   Object.keys(other).map((val) => {
    //     if(demoAnswer[val].answer.text !== null) {
    //       if(demoAnswer[val].answer.text.includes('Other')) {
    //         let index = demoAnswer[val].answer.text.indexOf('Other');
    //         demoAnswer[val].answer.text[index] = other[val]
    //       }
    //     }
    //   })
    // }
    let arr = [].concat(
      demoAnswer.filter((item) => item.change === true),
      answer.filter((item) => item.change === true)
    );
    if (arr.length > 0) {
      let data = {
        responses: arr,
      };
      APIHelpers.PUT("v1/assessmentEntry/responses", data)
        .then(() => {
          // if(isoDoc.length === 0) {
          message.success({
            content: "Your Assessment has been saved as draft.",
            style: {
              fontSize: "20px",
              marginTop: "100px",
            },
            duration: 5,
          });
          router.push("/esg/dashboard");
          // }
        })
        .catch(() => {
          message.error({
            content: `Your Assessment has not been saved. Please click on the "Save as Draft" button before you exit this page.`,
            style: {
              fontSize: "20px",
              marginTop: "100px",
            },
            duration: 8,
          });
        });
    } else {
      message.success({
        content: "Your Assessment has been saved as draft.",
        style: {
          fontSize: "20px",
          marginTop: "100px",
        },
        duration: 5,
      });
      router.push("/esg/dashboard");
    }
    // if(isoDoc.length > 0) {
    //   let form = new FormData();
    //   isoDoc.map((val) => {
    //     form.append("isoDocs", val)
    //   })
    //   APIHelpers.PUT("v1/assessment?id=" + assessment, form, {
    //     "Content-Type": "multipart/form-data",
    //   })
    //   .then(() => {
    //     message.success({
    //       content: "Your Assessment has been saved as draft.",
    //       style: {
    //         fontSize: "20px",
    //       },
    //       duration: 5,
    //     });
    //     router.push("/sme/dashboard")
    //   })
    //   .catch(() => {
    //     message.error({
    //       content: `Your Assessment has not been saved. Please click on the "Save as Draft" button before you exit this page.`,
    //       style: {
    //         fontSize: "20px",
    //       },
    //       duration: 8,
    //     });
    //   })
    // }
    // if(arr.length === 0 && isoDoc.length === 0) {
    //   message.success({
    //     content: "Your Assessment has been saved as draft.",
    //     style: {
    //       fontSize: "20px",
    //     },
    //     duration: 5,
    //   });
    //   router.push("/sme/dashboard")
    // }
  };

  const next = () => {
    if (tab === 0) {
      let answerTemp = [];
      demoAnswer.map((val) => {
        if (val.change === true) {
          answerTemp.push({
            assessmentEntryID: val.id,
            answer: val.answer,
          });
        }
      });
      if (answerTemp.length > 0) {
        let data = {
          responses: answerTemp,
        };
        APIHelpers.PUT("v1/assessmentEntry/responses", data)
          .then(() => {
            setTab(tab + 1);
            window.scrollTo({
              top: questionStart.current.offsetTop,
              behavior: "smooth",
            });
          })
          .catch(() => {});
      } else {
        setTab(tab + 1);
        window.scrollTo({
          top: questionStart.current.offsetTop,
          behavior: "smooth",
        });
      }
    } else if (tab === dimension.length - 1) {
      setSubmitDisabled(true);
      let arr = answer.filter((item) => item.question.dimension === dimension[tab]);
      let answerTemp = [];
      arr.map((val) => {
        if (val.change === true) {
          answerTemp.push({
            assessmentEntryID: val.id,
            answer: val.answer,
          });
        }
      });
      if (answerTemp.length > 0) {
        let data = {
          responses: answerTemp,
        };
        APIHelpers.PUT("v1/assessmentEntry/responses", data)
          .then(() => {
            if (sme.approvedBy !== null) {
              confirmSubmit();
            } else {
              blockSubmit();
            }
            // submit();
            // setTab(tab + 1);
            // window.scrollTo({
            //   top: questionStart.current.offsetTop,
            //   behavior: "smooth",
            // });
          })
          .catch(() => {
            setSubmitDisabled(false);
          });
      } else {
        if (sme.approvedBy !== null) {
          confirmSubmit();
        } else {
          blockSubmit();
        }
        // submit();
        // setTab(tab + 1);
        // window.scrollTo({
        //   top: questionStart.current.offsetTop,
        //   behavior: "smooth",
        // });
      }
    } else {
      if ((!other[dimension[tab]] && tempUploadDoc[dimension[tab]] && tempUploadDoc[dimension[tab]].length > 0) || (other[dimension[tab]] && !tempUploadDoc[dimension[tab]])) {
        message.error({
          content: `Please complete the Others upload field before you click on the "Next" button.`,
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      } else {
        // else {
        // if (Object.keys(other).length > 0) {
        //   Object.keys(other).map((val) => {
        //     if (answer[val].answer.text !== null) {
        //       if (demoAnswer[val].answer.text.includes("Other")) {
        //         let index = demoAnswer[val].answer.text.indexOf("Other");
        //         demoAnswer[val].answer.text[index] = other[val];
        //       }
        //     }
        //   });
        // }
        let arr = answer.filter((item) => item.question.dimension === dimension[tab] && item.change === true);
        let all = answer.filter((item) => item.question.dimension === dimension[tab]);
        let upload = all.findIndex((item) => item.questionType === "UPLOAD" && item.question.options.length > 2);
        let list = Object.keys(tempUploadDoc[dimension[tab]]).filter((item) => item !== dimension[tab] && tempUploadDoc[dimension[tab]][item].length > 0);
        if (other[dimension[tab]]) {
          list.push(other[dimension[tab]]);
        }
        if (upload !== -1) {
          arr[upload] = all[upload];
          arr[upload].answer.text = list;
        }
        setIsoDoc(list);
        let answerTemp = [];
        arr.map((val) => {
          answerTemp.push({
            assessmentEntryID: val.id,
            answer: val.answer,
          });
        });
        if (answerTemp.length > 0) {
          let data = {
            responses: answerTemp,
          };
          APIHelpers.PUT("v1/assessmentEntry/responses", data)
            .then(() => {
              setTab(tab + 1);
              window.scrollTo({
                top: questionStart.current.offsetTop,
                behavior: "smooth",
              });
            })
            .catch(() => {});
        } else {
          setTab(tab + 1);
          window.scrollTo({
            top: questionStart.current.offsetTop,
            behavior: "smooth",
          });
        }
      }
    }
  };

  const prev = () => {
    let arr = [].concat(
      demoAnswer.filter((item) => item.change === true),
      answer.filter((item) => item.change === true)
    );
    if (arr.length > 0) {
      let data = {
        responses: arr,
      };
      APIHelpers.PUT("v1/assessmentEntry/responses", data)
        .then(() => {
          setTab(tab - 1);
          window.scrollTo({
            top: questionStart.current.offsetTop,
            behavior: "smooth",
          });
        })
        .catch(() => {});
    } else {
      setTab(tab - 1);
      window.scrollTo({
        top: questionStart.current.offsetTop,
        behavior: "smooth",
      });
    }
  };

  const submit = () => {
    let empty = 0;
    demoAnswer.map((val) => {
      if (val.answer.scalar === null) {
        empty += 1;
      }
    });
    // let notNull = answer.map((item) => item.answer.text).filter((val) => val !== null);
    // let checkOther = notNull.filter((val) => !val.includes("Other")).length;
    // let otherLength = 1

    // Object.keys(other).map((val) => {
    //   if(other[val] !== "") {
    //     otherLength += 1
    //   }
    // })
    if (answer.filter((item) => item.questionType !== "UPLOAD" && item.change === false && item.respondStatus === "TO_START").length > 0) {
      setSubmitDisabled(false);
      message.error({
        content: `Please complete all the Assessment questions before you click on the "Submit" button.`,
        style: {
          fontSize: "20px",
          marginTop: "100px",
        },
        duration: 8,
      });
    } else if (empty > 0) {
      setSubmitDisabled(false);
      message.error({
        content: `Please complete all the General questions before you click on the "Submit" button.`,
        style: {
          fontSize: "20px",
          marginTop: "100px",
        },
        duration: 8,
      });
    }
    // else if (isoDoc.filter((item) => typeof item === "string").length > 0) {
    //   message.error({
    //     content: `Please upload all the required files before you click on the "Submit" button.`,
    //     style: {
    //       fontSize: "20px",
    //     },
    //     duration: 8,
    //   });
    // }
    else {
      let form = new FormData();
      let ssm = sme.ssmNumber;
      let date = new Date();
      let no = "10" + ssm.slice(-4) + ("0" + date.getDate()).slice(-2) + ("0" + (date.getMonth() + 1)).slice(-2) + date.getFullYear().toString();
      form.append("serialNo", no);
      Object.keys(tempUploadDoc).map((val) => {
        Object.keys(tempUploadDoc[val]).map((val1) => {
          if (tempUploadDoc[val][val1].length > 0) {
            form.append("isoDocs", tempUploadDoc[val][val1][0]);
          }
        });
      });
      APIHelpers.PUT("v1/assessment?id=" + assessment, form, {
        "Content-Type": "multipart/form-data",
      })
        .then(() => {
          APIHelpers.PUT("v1/assessmentEntry/submit?assessmentId=" + assessment)
            .then(() => {
              message.success({
                content: "Thank you! You have successfully submitted your Assessment. You can view your Assessmen Report by clicking on the View Icon.",
                style: {
                  fontSize: "20px",
                  marginTop: "100px",
                },
                duration: 5,
              });
              router.push("/esg/dashboard");
            })
            .catch(() => {
              setSubmitDisabled(false);
              message.error({
                content: "Your Assessment was not submitted",
                style: {
                  fontSize: "20px",
                  marginTop: "100px",
                },
                duration: 8,
              });
            });
        })
        .catch(() => {
          setSubmitDisabled(false);
          message.error({
            content: "Your Assessment was not submitted",
            style: {
              fontSize: "20px",
              marginTop: "100px",
            },
            duration: 8,
          });
        });
    }
  };

  const confirmSubmit = () => {
    Modal.confirm({
      width: 800,
      okText: "Proceed",
      cancelText: "Cancel",
      title: "Please ensure that all information and uploaded documents are correct. Once submitted, you can no longer modify them.",
      content: "As a reminder, your ESG Assessment Report can only be generated if your Company Profile status has been “Verified”.",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        submit();
      },
      onCancel() {
        setSubmitDisabled(false);
      },
    });
  };

  const blockSubmit = () => {
    Modal.error({
      width: 700,
      content: (
        <div className="text-xl font-semibold">
          <p>Your ESG Assessment Report can only be generated if your Company Profile status has been “Verified”.</p>
          <br />
        </div>
      ),
      onOk() {
        setSubmitDisabled(false);
      },
      onCancel() {
        setSubmitDisabled(false);
      },
    });
  };

  return (
    <Layout className="min-h-full">
      <Header />
      <Content className="bg-white px-8 1000:px-32 min-h-9/10 w-full ">
        <Row className="relative">
          <p className="text-5xl font-semibold mt-4" style={{ color: '#D8BFD8' }}>Welcome to the CSI Business Sustainability Assessment!</p>
        </Row>
        <Row>
          <ol className="mt-4 text-sm 1000:text-base font-medium">
            <li key={0}>1. The Assessment consists of 50 questions covering the Environmental, Social, Governance and Sustainable Procurement dimensions.</li>
            <li key={1}>2. The Assessment will take approximately 30 mins to complete. You may save your progress at any stage and return to complete the Assessment later .</li>
            <li key={2}>
              3. You may be required to upload some supporting documents, if applicable, such as:
              <ul className="text-lg pl-12 text-sm 1000:text-base font-medium" style={{ listStyleType: "disc" }}>
                <li>ISO 14000 Environmental Management Systems</li>
                <li>ISO 30415 Human Resource Management - Diversity and inclusion</li>
                <li>ISO 45001 Occupational Health and Safety Management Systems (OH&S)</li>
                <li>ISO 14006:2020. Environmental management systems</li>
                <li>ISO/IEC 27000 Information Security Management Systems (ISMS)</li>
                <li>ISO 37001 Anti-Bribery Management Systems</li>
              </ul>
            </li>
            <li key={3}>4. Please note that your assessment report will only be generated if your company profile shows a “Verified” status.</li>
            <li key={4}>5. You are allowed to complete the Assessment once every 6 months.</li>
          </ol>
        </Row>
        <Row className="mt-8 mb-16 w-full bg-white shadow-lg px-8 py-8 1400:px-16 border-2" ref={questionStart}>
          <Col className="hidden 1400:block 1400:w-1/5">
            <Steps direction="vertical" current={tab}>
              {dimenDisplay.map((val, index) => (
                <Step title={val} key={index} />
              ))}
            </Steps>
          </Col>
          <Col className="1400:hidden ">
            <p className="font-bold text-3xl">
              {tab + 1}.{dimension[tab]}
            </p>
          </Col>
          <Col className="1400:w-4/5">
            {tab === 0 ? showDemographics() : Object.keys(question).length > 0 ? showQuestions(dimension[tab]) : null}
            <Row className="flex justify-center py-16 gap-x-4">
              <div className="gap-x-4 flex flex-col 820:flex-row verticalGap">
                <Button className="border-2 bg-assessmentDraft py-4 px-8 flex items-center gap-x-4 justify-center hover:bg-assessmentDraft focus:bg-assessmentDraft" onClick={() => saveAsDraft()}>
                  <p className="text-lg text-white">Save As Draft</p>
                </Button>
                {tab !== 0 ? (
                  <Button className="w-[140px] h-[50px] py-2 bg-assessmentNext text-white hover:bg-assessmentNext focus:bg-assessmentNext hover:bg-assessmentNext focus:text-white" onClick={() => prev()}>
                    <p className="text-lg text-white flex items-center justify-center text-center">
                      <LeftOutlined className="mr-2 text-base" />
                      Previous
                    </p>
                  </Button>
                ) : null}
                {tab + 1 !== dimension.length ? (
                  <Button className="w-[140px] h-[50px] py-2 bg-assessmentNext text-white hover:bg-assessmentNext focus:bg-assessmentNext hover:bg-assessmentNext focus:text-white" onClick={() => next()}>
                  <p className="text-lg text-white flex items-center justify-center text-center">
                    Next
                    <RightOutlined className="ml-2 text-base" />
                  </p>
                </Button>
                ) : (
                  <Button className="border-2 bg-assessmentNext text-2xl py-4 px-16 flex items-center gap-x-4 justify-center hover:bg-assessmentNext focus:bg-assessmentNext" disabled={submitDisabled} onClick={() => next()}>
                    <p className="text-lg text-white flex items-center justify-center text-center">Submit</p>
                  </Button>
                )}
              </div>
            </Row>
          </Col>
        </Row>
      </Content>
      <Footer />
    </Layout>
  );
}

export default AssessmentPage;

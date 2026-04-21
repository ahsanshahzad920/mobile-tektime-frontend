import React from "react";
import { Card, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
const DecisionCard = ({ data, meeting }) => {
  return (
    <div className="d-flex gap-3 reportdecisioncard flex-wrap">
      {data?.map((item, index) => {
        if (!item || !item.decision) return null;

        // Ensure it's always an array
        const decisions = Array.isArray(item.decision)
          ? item.decision
          : [item.decision];

        return (
          <React.Fragment key={index}>
            {decisions.map((decisionItem, decisionIndex) => {
              if (!decisionItem || !decisionItem.decision) return null;

              return (
                <Col xs={12} sm={6} md={4} lg={3} key={decisionIndex}>
                  <Card className="mt-4 participant-card">
                    <Card.Body>
                      <div className="d-flex flex-column gap-3">
                        {/* Index and Decision Description */}
                        <div className="d-flex justify-content-start align-items-center">
                          <div className="numbers">
                            <div className="number">{decisionIndex + 1}</div>
                          </div>
                          <div
                            className="decision-paragraph"
                            style={{ marginLeft: "10px" }}
                          >
                            <div
                              dangerouslySetInnerHTML={{
                                __html: decisionItem?.decision || "",
                              }}
                            />
                          </div>
                        </div>

                        {/* Decision Apply */}
                        <div className="d-flex justify-content-end align-items-center">
                          <div className="team-btn">
                            {decisionItem?.decision_apply}
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default DecisionCard;

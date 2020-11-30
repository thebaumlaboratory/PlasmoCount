import React from "react";
import { Pagination } from "semantic-ui-react";

const TablePagination = ({ activePage, handlePageChange, totalPages }) => (
  <Pagination
    activePage={activePage}
    onPageChange={handlePageChange}
    totalPages={totalPages}
    ellipsisItem={null}
    firstItem={null}
    lastItem={null}
    siblingRange={1}
    boundaryRange={0}
  />
);

export default TablePagination;

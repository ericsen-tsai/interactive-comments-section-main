import { createSlice, isAnyOf } from "@reduxjs/toolkit"
import _ from "lodash"
import {
  fetchComment,
  fetchComments,
  createComment,
  createReply,
  editComment,
  editReply,
  deleteComment,
  deleteReply,
} from "./commentService"

const initialState = {
  comments: {},
  isLoading: false,
  error: { isError: false, errMsg: "" },
  delete: {
    isOpenPopup: false,
    intendedDelete: {
      commentId: -1,
      replyId: -1,
    },
  },
}

export const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    clearCommentError: (state) => {
      state.error.isError = false
      state.error.errMsg = ""
    },
    togglePopup: (state) => {
      state.delete.isOpenPopup = !state.delete.isOpenPopup
    },
    clearIntendedDelete: (state) => {
      state.delete.intendedDelete = {
        commentId: -1,
        replyId: -1,
      }
    },
    chooseIntendedDelete: (state, action) => {
      state.delete.intendedDelete = {
        commentId: action.payload.commentId,
        replyId: action.payload.replyId,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isLoading = false
        state.comments = _.omit(state.comments, action.payload.id)
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false
        state.comments = _.keyBy(action.payload, "id")
      })
      .addMatcher(
        isAnyOf(
          fetchComment.pending,
          fetchComments.pending,
          createComment.pending,
          createReply.pending,
          editComment.pending,
          editReply.pending,
          deleteComment.pending,
          deleteReply.pending
        ),
        (state) => {
          state.isLoading = true
        }
      )
      .addMatcher(
        // When deleting reply is fulfilled there will be action.payload.
        // Because I use put method instead of delete.
        isAnyOf(
          fetchComment.fulfilled,
          createComment.fulfilled,
          createReply.fulfilled,
          editComment.fulfilled,
          editReply.fulfilled,
          deleteReply.fulfilled
        ),
        (state, action) => {
          state.isLoading = false
          state.comments = {
            ...state.comments,
            [action.payload.id]: action.payload,
          }
        }
      )
      .addMatcher(
        isAnyOf(
          fetchComment.rejected,
          fetchComments.rejected,
          createComment.rejected,
          createReply.rejected,
          editComment.rejected,
          editReply.rejected,
          deleteComment.rejected,
          deleteReply.rejected
        ),
        (state, action) => {
          state.isLoading = false
          state.comments = {}
          state.error.isError = true
          state.error.errMsg = action.payload
        }
      )
  },
})

export const {
  clearCommentError,
  togglePopup,
  chooseIntendedDelete,
  clearIntendedDelete,
} = commentSlice.actions

export const selectComments = (state) => state.comment.comments
export const selectIntendedDelete = (state) =>
  state.comment.delete.intendedDelete
export const selectIsOpenPopup = (state) => state.comment.delete.isOpenPopup
export const selectCommentError = (state) => state.comment.error

export default commentSlice.reducer

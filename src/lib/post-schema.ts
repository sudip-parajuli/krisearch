import type { PostRow } from "./data";
import type { Comment } from "@/types/database";
import { absoluteUrl } from "./seo";
type PublicComment = Comment & {
  profiles: { id: string; display_name: string | null } | null;
};
function author(profile: { id: string; display_name: string | null } | null) {
  return {
    "@type": "Person",
    name: profile?.display_name ?? "Anonymous",
    ...(profile ? { url: absoluteUrl(`/profile/${profile.id}`) } : {}),
  };
}
export function postSchema(post: PostRow, comments: PublicComment[]) {
  const url = absoluteUrl(`/post/${post.id}`);
  const top = comments.filter((c) => !c.parent_comment_id);
  const common = {
    "@context": "https://schema.org",
    url,
    inLanguage: /[\u0900-\u097f]/.test(post.title + post.body) ? "ne" : "en",
    datePublished: post.created_at,
  };
  if (post.type === "question") {
    const answers = top.map((c) => ({
      "@type": "Answer",
      text: c.body,
      datePublished: c.created_at,
      url: `${url}#comment-${c.id}`,
      author: author(c.profiles),
    }));
    return {
      ...common,
      "@type": "QAPage",
      mainEntity: {
        "@type": "Question",
        name: post.title,
        text: post.body,
        datePublished: post.created_at,
        author: author(post.profiles),
        answerCount: answers.length,
        acceptedAnswer: top
          .filter((c) => c.is_best_answer)
          .map((c) => answers[top.indexOf(c)]),
        suggestedAnswer: top
          .filter((c) => !c.is_best_answer)
          .map((c) => answers[top.indexOf(c)]),
      },
    };
  }
  return {
    ...common,
    "@type": "DiscussionForumPosting",
    headline: post.title,
    text: post.body,
    author: author(post.profiles),
    commentCount: comments.length,
    comment: comments.map((c) => ({
      "@type": "Comment",
      text: c.body,
      datePublished: c.created_at,
      url: `${url}#comment-${c.id}`,
      author: author(c.profiles),
    })),
  };
}

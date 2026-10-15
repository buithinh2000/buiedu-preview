// Placeholder deliberately refuses login; production must inject a VERIFIED OIDC session.
// Never request visitors to paste Bearer tokens into a public website.
export async function getAccessToken(){return null}

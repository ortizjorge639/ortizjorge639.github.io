# A soundtrack for the session

Let the session change the music without confusing intent with playback.

> This separately authored narrative describes a private implementation. Readers cannot inspect its code here. Historical validation described in project documentation was not independently rerun for this case study. No application, model, playback, ingestion or deployment was exercised. Individual authorship has not been independently established; this is not a claim of sole authorship. Private source redistribution requires separate review and permission.

## Two kinds of interruption

A soundtrack director must avoid changing music every time the work changes slightly. It must also avoid misleading the listener when a request is queued but playback has not caught up. This project addresses those as separate problems: a local policy chooses whether to act, and a playback boundary reports what was actually observed.

## A deliberately narrow input

A coding agent supplies a bounded scene label, tags and numeric dimensions such as energy or tension. The accepted scene format excludes source code, diffs, prompts, paths and private reasoning. That is a data-minimization boundary, not a promise that an arbitrary free-text label is safe: the sender must still avoid placing private material in permitted fields. The activity pane is a compact account of received signals and control states, not a raw coding transcript.

The selector uses human-curated playlist or album crates. Preference constraints rule out unsuitable choices before scoring. Minimum hold periods, crate cooldowns, track-boundary preference and temporary manual overrides reduce switching. This is deterministic selection over configured metadata, not automatic musical analysis or a claim that the system can infer a person's emotions.

## Playback and activation boundaries

The official Spotify Web API is the primary backend. A separately selected compatibility bridge is secondary, not the default playback engine. Playback requires Spotify Premium, user authorization, an active Connect device and usable crate configuration. Authorization uses PKCE without a client secret.

In the reviewed runtime, automatic adaptation starts enabled; the user can disable it or hold it. Holding adaptation does not pause music. A submitted control first enters a delivery lifecycle. The interface must distinguish receipt from an acknowledged result, and neither a preference acknowledgement nor a policy decision alone proves a new track is playing. Playback mutations are checked against fresh observations. Uncertain delivery must remain uncertain rather than invite an automatic duplicate request.

## Hypothetical illustration — not a bundled test

Imagine an agent reporting a recovery scene after a frustrating task. The policy might wait for a track boundary instead of interrupting immediately. A later observation could confirm a new context, or expose a failure. No playlist, song sequence, listening history or actual playback result is supplied here. This invented example explains the wait-and-observe boundary, not a successful music session.

## Evidence and limits

Documentation describes local HTTP/state regressions and browser checks, including fictional Spotify responses. Those historical tests do not establish current account access, physical-phone behavior or successful playback. No Spotify operation or application test was run for this narrative.

The application runs locally while its process is active. It is not a public music-control endpoint. The frontend does not generate audio, beatmatch, provide crossfade or add audio effects; visual text transitions should not be mistaken for audio mixing. Its contribution is a bounded session-to-selection workflow and honest state reporting, not proven productivity or mood improvement.

## Contribution boundary

Individual role unverified. The reviewed artifact combines a compact player, deterministic scene policy, Spotify authorization and explicit delivery-state handling. Spotify provides playback; the player is not an original audio engine or an official Spotify product.

<script lang="ts">
	import { walletGreet } from '../api/backend.api';

	let greetings = $state('');

	const onclick = async () => {
		greetings = "Loading...";

		try {
			greetings = await walletGreet(undefined);
		} catch (err) {
			greetings = `${err}`;
		}
	}
</script>

<button {onclick}>Call Wallet Greetings</button>

<div>
	<label for="greetings">Greetings:</label>
	<textarea id="greetings">{greetings}</textarea>
</div>

<hr />

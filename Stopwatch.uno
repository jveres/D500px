using Uno;
using Uno.Diagnostics;
using Fuse.Scripting;
using Fuse.Reactive;
using Fuse.Triggers;
using Fuse.Elements;
using Fuse;

public abstract class StopwatchTrigger : Trigger
{
	Stopwatch _stopwatch;
	public Stopwatch Stopwatch
	{
		get { return _stopwatch; }
		set
		{
			if (_stopwatch != null)
				_stopwatch.Ticked -= Tick;
			_stopwatch = value;
			_stopwatch.Ticked += Tick;
		}
	}

	void Tick()
	{
		var time = Math.Mod(Time(), 1.0) * _factor;
		if (IsRooted)
			Seek(time);
	}

	double _factor = 1.0;
	public double Factor { get { return _factor; } set { _factor = value; } }

	protected abstract double Time();
}

public class Hours : StopwatchTrigger
{
	protected override double Time()
	{
		return Stopwatch.EllapsedSeconds / (60*60);
	}
}

public class Minutes : StopwatchTrigger
{
   	protected override double Time()
	{
		return Stopwatch.EllapsedSeconds / (60);
	}
}

public class Seconds : StopwatchTrigger
{
	protected override double Time()
	{
		return Stopwatch.EllapsedSeconds;
	}
}

public class Tenths : StopwatchTrigger
{
	protected override double Time()
	{
		return Stopwatch.EllapsedSeconds * 10.0;
	}
}

public class Hundredths : StopwatchTrigger
{
	protected override double Time()
	{
		return Stopwatch.EllapsedSeconds * 100.0;
	}
}

public class Millis : StopwatchTrigger
{
	protected override double Time()
	{
		return Stopwatch.EllapsedSeconds * 1000.0;
	}
}






public delegate void StopwatchTickHandler();

public class Stopwatch : NativeModule
{
	public Stopwatch()
	{
		AddMember(new NativeFunction("Start", (NativeCallback)Start));
		AddMember(new NativeFunction("Stop", (NativeCallback)Stop));
		AddMember(new NativeFunction("Pause", (NativeCallback)Pause));
		AddMember(new NativeFunction("GetSeconds", (NativeCallback)GetSeconds));
	}

	public event StopwatchTickHandler Ticked;

	double _ellapsedSeconds = 0.0;
	public double EllapsedSeconds
	{
		get { return _ellapsedSeconds; }
	}

	public object GetSeconds(Context c, object[] args)
	{
		object ret = EllapsedSeconds;
		return ret;
	}

	public object Start(Context c, object[] args)
	{
		Start();
		return null;
	}

	public object Stop(Context c, object[] args)
	{
		Stop();
		return null;
	}

	public object Pause(Context c, object[] args)
	{
		Pause();
		return null;
	}


	bool _isPaused = false;
	double _lastTick = 0.0f;
	bool _subscribedToUpdate = false;

	void Tick()
	{
		if (Ticked != null && !_isPaused)
		{
			_ellapsedSeconds += Uno.Diagnostics.Clock.GetSeconds() - _lastTick;
			_lastTick = Uno.Diagnostics.Clock.GetSeconds();
			Ticked();
		}
	}

	public void Start()
	{
		if (_isPaused)
		{
			_lastTick = Uno.Diagnostics.Clock.GetSeconds();
			_isPaused = false;
			return;
		}
		_lastTick = Uno.Diagnostics.Clock.GetSeconds();
		if (!_subscribedToUpdate)
		{
			UpdateManager.AddAction(Tick);
			_subscribedToUpdate = true;
		}
	}


	public void Stop()
	{
		if (_subscribedToUpdate)
		{
			UpdateManager.RemoveAction(Tick);
			_subscribedToUpdate = false;
		}
		_isPaused = false;
		_ellapsedSeconds = 0.0;
		if (Ticked != null)
			Ticked();
	}

	public void Pause()
	{
		_isPaused = true;
	}

	public void Restart()
	{
		Stop();
		Start();
	}
}